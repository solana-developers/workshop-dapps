use anchor_lang::prelude::*;

use crate::state::SolanaRetweet;
use crate::state::SolanaTweet;
use crate::state::SolanaTwitterProfile;


pub fn create_retweet(
    ctx: Context<CreateRetweet>,
) -> Result<()> {

    let tweet = &mut ctx.accounts.tweet;
    let retweet = SolanaRetweet::new(
        ctx.accounts.authority.key(),
        ctx.accounts.profile.key(),
        tweet.key(),
        ctx.accounts.authority.key(),
    );
    ctx.accounts.retweet.set_inner(retweet.clone());
    tweet.retweet_count += 1;
    Ok(())
}

#[derive(Accounts)]
pub struct CreateRetweet<'info> {
    #[account(
        init,
        payer = authority,
        space = SolanaRetweet::ACCOUNT_SPACE,
        seeds = [
            SolanaRetweet::SEED_PREFIX.as_ref(),
            profile.key().as_ref(),
            tweet.key().as_ref(),
        ],
        bump
    )]
    pub retweet: Account<'info, SolanaRetweet>,
    #[account(mut)]
    pub tweet: Account<'info, SolanaTweet>,
    #[account(
        mut,
        has_one = authority,
    )]
    pub profile: Account<'info, SolanaTwitterProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
