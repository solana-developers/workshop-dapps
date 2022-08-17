use anchor_lang::prelude::*;

use crate::create_user_account::SolanaTwitterAccountInfo;


pub fn write_tweet(
    ctx: Context<WriteTweet>,
    body: String,
    _twitter_account_bump: u8,
) -> Result<()> {

    msg!("Publishing new tweet...");
    msg!("  Solana Twitter account address: {}", ctx.accounts.twitter_account.key());

    let existing_twitter_account = &mut ctx.accounts.twitter_account;
    existing_twitter_account.tweet_count += 1;
    
    let new_tweet = &mut ctx.accounts.tweet;
    new_tweet.wallet_pubkey = ctx.accounts.authority.key();
    new_tweet.twitter_account_pubkey = existing_twitter_account.key();
    new_tweet.tweet_number = existing_twitter_account.tweet_count;
    new_tweet.body = body;

    msg!("Tweet published successfully.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    body: String,
    twitter_account_bump: u8,
)]
pub struct WriteTweet<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 40,
        seeds = [
            authority.key().as_ref(),
            b"_tweet_",
            (twitter_account.tweet_count + 1).to_string().as_ref()
        ],
        bump
    )]
    pub tweet: Account<'info, SolanaTweet>,
    #[account(
        mut,
        has_one = authority,
        seeds = [
            authority.key().as_ref(),
            b"_profile"
        ],
        bump = twitter_account_bump,
    )]
    pub twitter_account: Account<'info, SolanaTwitterAccountInfo>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct SolanaTweet {
    pub wallet_pubkey: Pubkey,
    pub twitter_account_pubkey: Pubkey,
    pub tweet_number: u32,
    pub body: String,
}