use anchor_lang::prelude::*;

use crate::state::StoreEmoji;


/*
* Creates an emoji PDA for the store.
*/
pub fn create_store_emoji(
    ctx: Context<CreateStoreEmoji>,
    emoji_seed: String,
    display: String,
    starting_balance: u8,
    starting_price: u64,
) -> Result<()> {

    ctx.accounts.store_emoji.set_inner(
        StoreEmoji::new(
            emoji_seed,
            display,
            starting_balance,
            starting_price,
            ctx.accounts.authority.key(),
        )
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    emoji_seed: String,
    display: String,
    starting_balance: u8,
    starting_price: u64,
)]
pub struct CreateStoreEmoji<'info> {
    #[account(
        init, 
        payer = authority, 
        space = StoreEmoji::ACCOUNT_SPAN,
        seeds = [
            StoreEmoji::SEED_PREFIX.as_bytes().as_ref(), 
            emoji_seed.as_bytes()
        ],
        bump
    )]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}


/*
* Updates the price of an emoji in the store.
*/
pub fn update_store_emoji_price(
    ctx: Context<UpdateStoreEmojiPrice>,
    _emoji_seed: String,
    new_price: u64,
) -> Result<()> {

    ctx.accounts.store_emoji.price = new_price;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateStoreEmojiPrice<'info> {
    #[account(
        mut, 
        has_one = authority,
    )]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}


/*
* Closes a store emoji account.
*/
pub fn close_store_emoji(
    _ctx: Context<CloseStoreEmoji>,
) -> Result<()> {

    Ok(())
}

#[derive(Accounts)]
pub struct CloseStoreEmoji<'info> {
    #[account(
        mut,
        has_one = authority,
        close = authority,
    )]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

