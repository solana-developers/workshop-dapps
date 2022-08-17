use anchor_lang::prelude::*;

use crate::create_user_account::SolanaTwitterAccountInfo;


pub fn modify_user_account(
    ctx: Context<ModifyUserAccount>,
    handle: String,
    display_name: String,
    _twitter_account_bump: u8,
) -> Result<()> {

    msg!("Modifying Solana Twitter account...");
    msg!("  Solana Twitter account address: {}", ctx.accounts.twitter_account.key());

    let existing_twitter_account = &mut ctx.accounts.twitter_account;
    existing_twitter_account.handle = handle;
    existing_twitter_account.display_name = display_name;

    msg!("Solana Twitter account updated successfully.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    handle: String,
    display_name: String,
    twitter_account_bump: u8,
)]
pub struct ModifyUserAccount<'info> {
    #[account(
        mut,
        seeds = [
            authority.key().as_ref(),
            b"_profile"
        ],
        bump = twitter_account_bump
    )]
    pub twitter_account: Account<'info, SolanaTwitterAccountInfo>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
