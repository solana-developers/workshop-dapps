use anchor_lang::prelude::*;


#[account]
pub struct SolanaTwitterProfile  {
    pub handle: String,
    pub display_name: String,
    pub tweet_count: u32,
    pub authority: Pubkey,
    pub bump: u8,
}

impl SolanaTwitterProfile {

    pub const ACCOUNT_SPACE: usize = 8 + 40 + 40 + 4 + 32 + 1;

    pub const SEED_PREFIX: &'static str = "profile";

    pub fn new(
        handle: String,
        display_name: String,
        authority: Pubkey,
        bump: u8,
    ) -> Self {
        
        SolanaTwitterProfile {
            handle,
            display_name,
            tweet_count: 0,
            authority,
            bump,
        }
    }
}