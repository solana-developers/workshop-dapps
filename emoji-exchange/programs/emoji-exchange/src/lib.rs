use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::*;


declare_id!("86GDPzi1UcCP91Ruvn2CJxSZnbwjmptn5ikKJAiqubyP");


#[program]
pub mod emoji_exchange {
    use super::*;

    pub fn create_vault(
        ctx: Context<CreateVault>,
    ) -> Result<()> {
        
        vault::create_vault(
            ctx, 
        )
    }

    pub fn fund_vault(
        ctx: Context<FundVault>,
        lamports: u64,
    ) -> Result<()> {

        vault::fund_vault(
            ctx, 
            lamports
        )
    }

    pub fn close_vault(
        ctx: Context<CloseVault>,
    ) -> Result<()> {
        
        vault::close_vault(
            ctx, 
        )
    }

    pub fn create_store_emoji(
        ctx: Context<CreateStoreEmoji>,
        emoji_seed: String,
        display: String,
        starting_balance: u8,
        starting_price: u64,
    ) -> Result<()> {
        
        store::create_store_emoji(
            ctx, 
            emoji_seed, 
            display,
            starting_balance, 
            starting_price
        )
    }

    pub fn update_store_emoji_price(
        ctx: Context<UpdateStoreEmojiPrice>,
        emoji_seed: String,
        new_price: u64,
    ) -> Result<()> {
        
        store::update_store_emoji_price(
            ctx, 
            emoji_seed, 
            new_price
        )
    }

    pub fn close_store_emoji(
        ctx: Context<CloseStoreEmoji>,
    ) -> Result<()> {
        
        store::close_store_emoji(
            ctx, 
        )
    }

    pub fn create_user_metadata(
        ctx: Context<CreateUserMetadata>,
        username: String,
        initial_ebucks: u64,
    ) -> Result<()> {
        
        user::create_user_metadata(
            ctx, 
            username,
            initial_ebucks,
        )
    }

    pub fn close_user_metadata(
        ctx: Context<CloseUserMetadata>,
    ) -> Result<()> {
        
        user::close_user_metadata(
            ctx, 
        )
    }

    pub fn create_user_emoji(
        ctx: Context<CreateUserEmoji>,
        emoji_seed: String,
    ) -> Result<()> {
        
        user::create_user_emoji(
            ctx, 
            emoji_seed
        )
    }

    pub fn close_user_emoji(
        ctx: Context<CloseUserEmoji>,
    ) -> Result<()> {
        
        user::close_user_emoji(
            ctx, 
        )
    }

    pub fn place_order(
        ctx: Context<PlaceOrder>,
        emoji_seed: String,
        order_type: OrderType, 
        quantity: u8,
    ) -> Result<()> {
        
        order::place_order(
            ctx,
            emoji_seed,
            order_type,
            quantity,
        )
    }
}

