use anchor_lang::prelude::*;

use crate::state::SolanaLike;
use crate::state::SolanaTweet;
use crate::state::SolanaTwitterProfile;


pub fn create_like(
    ctx: Context<CreateLike>,
) -> Result<()> {

    msg!("Submitting new Like...");
    msg!("  Tweet to be liked: {}", ctx.accounts.tweet.key());
    msg!("  Submitter's profile: {}", ctx.accounts.profile.key());
    let tweet = &mut ctx.accounts.tweet;
    let like = SolanaLike::new(
        ctx.accounts.authority.key(),
        ctx.accounts.profile.key(),
        tweet.key(),
        ctx.accounts.authority.key(),
        *ctx.bumps.get(SolanaLike::SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.like.set_inner(like.clone());
    tweet.like_count += 1;
    msg!("Like submitted successfully.");
    Ok(())
}

#[derive(Accounts)]
pub struct CreateLike<'info> {
    #[account(
        init,
        payer = authority,
        space = SolanaLike::ACCOUNT_SPACE,
        seeds = [
            SolanaLike::SEED_PREFIX.as_bytes().as_ref(),
            profile.key().as_ref(),
            tweet.key().as_ref(),
        ],
        bump
    )]
    pub like: Account<'info, SolanaLike>,
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
            SolanaTwitterProfile::SEED_PREFIX.as_ref(),
            authority.key().as_ref(),
        ],
        bump = profile.bump,
    )]
    pub profile: Account<'info, SolanaTwitterProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
