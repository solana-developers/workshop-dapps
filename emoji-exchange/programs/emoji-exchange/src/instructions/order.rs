use anchor_lang::prelude::*;

use crate::state::{ 
    StoreEmoji, 
    UserEmoji, 
    UserMetadata, 
};


/*
* Facilitates a buy or sell of an emoji.
*/
pub fn place_order(
    ctx: Context<PlaceOrder>,
    _emoji_seed: String,
    order_type: OrderType, 
    quantity: u8,
) -> Result<()> {

    let user_metadata = &mut ctx.accounts.user_metadata;
    let user_emoji = &mut ctx.accounts.user_emoji;
    let store_emoji = &mut ctx.accounts.store_emoji;
    
    // Price action that results from an order
    //
    let price_action = quantity as f64 / 10.;

    match order_type {

        OrderType::Buy => {
            
            if quantity > store_emoji.balance {
                return Err(error!(OrderError::InsufficientStoreBalance))
            };
            
            // User balance increases with purchase
            // User's cost average for emojis held is changed
            //
            let new_user_balance = user_emoji.balance + quantity;
            user_emoji.cost_average = ((user_emoji.cost_average * user_emoji.balance as u64) + (store_emoji.price * quantity as u64)) / new_user_balance as u64;
            
            store_emoji.balance -= quantity;

            user_emoji.balance = new_user_balance;
            user_metadata.ebucks_balance -= store_emoji.price * quantity as u64;
            user_metadata.trade_count += 1;

            // Price action is applied to the emoji price as a result of the order
            //
            let new_price = store_emoji.price as f64 * (1. + price_action);
            store_emoji.price = new_price as u64;
        },

        OrderType::Sell => {
            
            if quantity > user_emoji.balance {
                return Err(error!(OrderError::InsufficientUserBalance))
            };
            
            store_emoji.balance += quantity;
            
            user_emoji.balance -= quantity;
            user_metadata.ebucks_balance += store_emoji.price * quantity as u64;
            user_metadata.trade_count += 1;
            
            // Price action is applied to the emoji price as a result of the order
            //
            let new_price = store_emoji.price as f64 * (1. - price_action);
            store_emoji.price = new_price as u64;
        }
    };

    msg!("Order processed successfully.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    emoji_seed: String,
    order_type: OrderType, 
    quantity: u8,
)]
pub struct PlaceOrder<'info> {
    #[account(
        mut, 
        has_one = authority,
    )]
    pub user_metadata: Account<'info, UserMetadata>,
    #[account(
        mut, 
        has_one = authority,
    )]
    pub user_emoji: Account<'info, UserEmoji>,
    #[account(mut)]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub enum OrderType {
    Buy,
    Sell,
}

#[error_code]
pub enum OrderError {
    #[msg("Insufficient store balance.")]
    InsufficientStoreBalance,
    #[msg("Insufficient user balance.")]
    InsufficientUserBalance,
}