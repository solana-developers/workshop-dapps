use anchor_lang::{
    AccountsClose,
    prelude::*,
};


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

    msg!("Request to create Store Emoji PDA for emoji: {}", emoji_seed);
    let store_emoji = &mut ctx.accounts.store_emoji;
    store_emoji.emoji_name = emoji_seed;
    store_emoji.display = display;
    store_emoji.balance = starting_balance;
    store_emoji.price = starting_price;
    msg!("Success.");
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
        payer = store_wallet, 
        space = 8 + 40 + 8 + 64 + 32,
        seeds = [
            b"store_emoji_", 
            emoji_seed.as_bytes()
        ],
        bump
    )]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}


/*
* Updates the price of an emoji in the store.
*/
pub fn update_store_emoji_price(
    ctx: Context<UpdateStoreEmojiPrice>,
    _store_emoji_bump: u8,
    emoji_seed: String,
    new_price: u64,
) -> Result<()> {

    msg!("Request to update price for emoji: {}", emoji_seed);
    let store_emoji = &mut ctx.accounts.store_emoji;
    store_emoji.price = new_price;
    msg!("Success.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    store_emoji_bump: u8,
    emoji_seed: String,
    new_price: u64,
)]
pub struct UpdateStoreEmojiPrice<'info> {
    #[account(
        mut, 
        seeds = [
            b"store_emoji_", 
            emoji_seed.as_bytes()
        ],
        bump = store_emoji_bump
    )]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* Closes a store emoji account.
*/
pub fn close_store_emoji(
    ctx: Context<CloseStoreEmoji>,
) -> Result<()> {

    let store_emoji = &mut ctx.accounts.store_emoji;
    store_emoji.close(ctx.accounts.store_wallet.to_account_info())
}

#[derive(Accounts)]
pub struct CloseStoreEmoji<'info> {
    #[account(mut)]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* The store emoji data
*/
#[account]
pub struct StoreEmoji {
    pub emoji_name: String,
    pub display: String,
    pub balance: u8,
    pub price: u64,
}