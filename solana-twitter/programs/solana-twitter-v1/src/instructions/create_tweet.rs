use anchor_lang::prelude::*;

use crate::state::SolanaTwitterProfile;
use crate::state::SolanaTweet;


pub fn create_tweet(
    ctx: Context<CreateTweet>,
    body: String,
) -> Result<()> {

    let profile = &mut ctx.accounts.profile;
    let tweet = SolanaTweet::new(
        ctx.accounts.authority.key(),
        profile.key(),
        profile.tweet_count + 1,
        body,
    );
    ctx.accounts.tweet.set_inner(tweet.clone());
    profile.tweet_count += 1;
    Ok(())
}

#[derive(Accounts)]
pub struct CreateTweet<'info> {
    #[account(
        init,
        payer = authority,
        space = SolanaTweet::ACCOUNT_SPACE,
        seeds = [
            SolanaTweet::SEED_PREFIX.as_ref(),
            profile.key().as_ref(),
            (profile.tweet_count + 1).to_string().as_ref(),
        ],
        bump
    )]
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