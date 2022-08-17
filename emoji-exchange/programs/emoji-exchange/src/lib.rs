use anchor_lang::prelude::*;

pub mod instructions;

use instructions::*;


declare_id!("CrMdx78x6xJCpCkBkQ5Fdqyd99HBynYGK5t9AezgNbCN");


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
        vault_bump: u8,
        lamports: u64,
    ) -> Result<()> {

        vault::fund_vault(
            ctx, 
            vault_bump, 
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
        store_emoji_bump: u8,
        emoji_seed: String,
        new_price: u64,
    ) -> Result<()> {
        
        store::update_store_emoji_price(
            ctx, 
            store_emoji_bump, 
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

    pub fn create_user_account(
        ctx: Context<CreateUserAccount>,
        username: String,
        initial_ebucks: u64,
    ) -> Result<()> {
        
        user::create_user_account(
            ctx, 
            username,
            initial_ebucks,
        )
    }

    pub fn close_user_account(
        ctx: Context<CloseUserAccount>,
    ) -> Result<()> {
        
        user::close_user_account(
            ctx, 
        )
    }

    pub fn create_user_emoji(
        ctx: Context<CreateUserEmoji>,
        store_emoji_bump: u8,
        emoji_seed: String,
    ) -> Result<()> {
        
        user::create_user_emoji(
            ctx, 
            store_emoji_bump,
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
        user_account_bump: u8,
        user_emoji_bump: u8,
        store_emoji_bump: u8,
        vault_bump: u8,
        emoji_seed: String,
        order_type: OrderType, 
        quantity: u8,
    ) -> Result<()> {
        
        order::place_order(
            ctx,
            user_account_bump,
            user_emoji_bump,
            store_emoji_bump,
            vault_bump,
            emoji_seed,
            order_type,
            quantity,
        )
    }
}

