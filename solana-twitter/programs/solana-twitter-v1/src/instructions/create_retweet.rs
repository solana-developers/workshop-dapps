use anchor_lang::prelude::*;

use crate::state::SolanaRetweet;
use crate::state::SolanaTweet;
use crate::state::SolanaTwitterProfile;


pub fn create_retweet(
    ctx: Context<CreateRetweet>,
) -> Result<()> {

    msg!("Submitting new Retweet...");
    msg!("  Tweet to be retweeted: {}", ctx.accounts.tweet.key());
    msg!("  Submitter's profile: {}", ctx.accounts.profile.key());
    let tweet = &mut ctx.accounts.tweet;
    let retweet = SolanaRetweet::new(
        ctx.accounts.authority.key(),
        ctx.accounts.profile.key(),
        tweet.key(),
        ctx.accounts.authority.key(),
        *ctx.bumps.get(SolanaRetweet::SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.retweet.set_inner(retweet.clone());
    tweet.retweet_count += 1;
    msg!("Retweet submitted successfully.");
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
    #[account(
        mut,
        seeds = [
            SolanaTweet::SEED_PREFIX.as_ref(),
            tweet.profile_pubkey.as_ref(),
            tweet.tweet_number.to_string().as_ref(),
        ],
        bump = tweet.bump,
    )]
    pub tweet: Account<'info, SolanaTweet>,
    #[account(
        mut,
        has_one = authority,
        seeds = [
            SolanaTwitterProfile::SEED_PREFIX.as_bytes().as_ref(),
            authority.key().as_ref(),
        ],
        bump = profile.bump,
    )]
    pub profile: Account<'info, SolanaTwitterProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
