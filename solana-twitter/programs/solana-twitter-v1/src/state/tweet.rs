use anchor_lang::prelude::*;


#[account]
pub struct SolanaTweet {
    pub wallet_pubkey: Pubkey,
    pub profile_pubkey: Pubkey,
    pub tweet_number: u32,
    pub like_count: u32,
    pub retweet_count: u32,
    pub body: String,
    pub bump: u8,
}

impl SolanaTweet {

    pub const ACCOUNT_SPACE: usize = 8 + 32 + 32 + 4 + 40 + 1;

    pub const SEED_PREFIX: &'static str = "tweet";

    pub fn new(
        wallet_pubkey: Pubkey,
        profile_pubkey: Pubkey,
        tweet_number: u32,
        body: String,
        bump: u8,
    ) -> Self {
        
        SolanaTweet {
            wallet_pubkey,
            profile_pubkey,
            tweet_number,
            like_count: 0,
            retweet_count: 0,
            body,
            bump,
        }
    }
}