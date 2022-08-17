use anchor_lang::{
    AccountsClose,
    prelude::*,
    system_program,
};

use crate::store::StoreEmoji;


/*
* Creates account PDA for a user.
*/
pub fn create_user_account(
    ctx: Context<CreateUserAccount>,
    username: String,
    initial_ebucks: u64,
) -> Result<()> {

    msg!("Request to create User Account PDA for wallet: {}", &ctx.accounts.user_wallet.key);
    let user_account = &mut ctx.accounts.user_account;
    user_account.username = username;
    user_account.ebucks_balance = initial_ebucks;
    user_account.trade_count = 0;
    user_account.cashed_out = false;
    msg!("Success.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    username: String,
    initial_ebucks: u64,
)]
pub struct CreateUserAccount<'info> {
    #[account(
        init, 
        payer = user_wallet, 
        space = 8 + 48 + 64 + 32 + 8,
        seeds = [
            user_wallet.key.as_ref(),
            b"_user_account"
        ],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* Marks a user as cashed out by updating their account.
*/
pub fn cash_out_user(
    ctx: Context<CashOutUser>,
    _user_account_bump: u8,
    amount: u64,
) -> Result<()> {

    msg!("Request to cash out user: {}", &ctx.accounts.user_account.username);
    msg!("Transferring SOL to {}...", &ctx.accounts.recipient.key);
    let user_account = &mut ctx.accounts.user_account;
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user_wallet.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            }
        ),
        amount
    )?;
    user_account.cashed_out = true;
    msg!("Success.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    user_account_bump: u8,
    amount: u64,
)]
pub struct CashOutUser<'info> {
    #[account(
        mut,
        seeds = [
            user_wallet.key.as_ref(),
            b"_user_account"
        ],
        bump = user_account_bump
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub recipient: SystemAccount<'info>,
    #[account(mut)]
    pub user_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* Closes a user account account.
*/
pub fn close_user_account(
    ctx: Context<CloseUserAccount>,
) -> Result<()> {

    let user_account = &mut ctx.accounts.user_account;
    user_account.close(ctx.accounts.store_wallet.to_account_info())
}

#[derive(Accounts)]
pub struct CloseUserAccount<'info> {
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* The user account data
*/
#[account]
pub struct UserAccount {
    pub username: String,
    pub ebucks_balance: u64,
    pub trade_count: u32,
    pub cashed_out: bool,
}


/*
* Creates an emoji PDA for a user.
*/
pub fn create_user_emoji(
    ctx: Context<CreateUserEmoji>,
    _store_emoji_bump: u8,
    emoji_seed: String,
) -> Result<()> {

    msg!("Request to create User Emoji PDA for emoji: {}", emoji_seed);
    let store_emoji = &ctx.accounts.store_emoji;
    let user_emoji = &mut ctx.accounts.user_emoji;
    user_emoji.emoji_name = store_emoji.emoji_name.clone();
    user_emoji.display = store_emoji.display.clone();
    user_emoji.balance = 0;
    user_emoji.cost_average = 0;
    msg!("Success.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    store_emoji_bump: u8,
    emoji_seed: String,
)]
pub struct CreateUserEmoji<'info> {
    #[account(
        mut, 
        seeds = [
            b"store_emoji_", 
            emoji_seed.as_bytes()
        ],
        bump = store_emoji_bump
    )]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(
        init, 
        payer = user_wallet, 
        space = 8 + 40 + 8,
        seeds = [
            user_wallet.key.as_ref(),
            b"_user_emoji_", 
            emoji_seed.as_bytes()
        ],
        bump
    )]
    pub user_emoji: Account<'info, UserEmoji>,
    #[account(mut)]
    pub user_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* Closes a user emoji account.
*/
pub fn close_user_emoji(
    ctx: Context<CloseUserEmoji>,
) -> Result<()> {

    let user_emoji = &mut ctx.accounts.user_emoji;
    user_emoji.close(ctx.accounts.store_wallet.to_account_info())
}

#[derive(Accounts)]
pub struct CloseUserEmoji<'info> {
    #[account(mut)]
    pub user_emoji: Account<'info, UserEmoji>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* The user emoji data
*/
#[account]
pub struct UserEmoji {
    pub emoji_name: String,
    pub display: String,
    pub balance: u8,
    pub cost_average: u64,
}