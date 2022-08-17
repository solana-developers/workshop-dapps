use anchor_lang::prelude::*;


pub fn create_user_account(
    ctx: Context<CreateUserAccount>,
    handle: String,
    display_name: String,
) -> Result<()> {

    msg!("Creating new Solana Twitter account...");

    let new_twitter_account = &mut ctx.accounts.twitter_account;
    new_twitter_account.handle = handle;
    new_twitter_account.display_name = display_name;
    new_twitter_account.tweet_count = 0;
    new_twitter_account.authority = ctx.accounts.authority.key();

    msg!("Solana Twitter account created successfully.");
    Ok(())
}

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 40 + 40 + 32 + 32,
        seeds = [
            authority.key().as_ref(),
            b"_profile"
        ],
        bump
    )]
    pub twitter_account: Account<'info, SolanaTwitterAccountInfo>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct SolanaTwitterAccountInfo {
    pub handle: String,
    pub display_name: String,
    pub tweet_count: u32,
    pub authority: Pubkey,
}