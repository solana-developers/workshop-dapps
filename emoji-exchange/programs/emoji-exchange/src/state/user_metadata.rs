use anchor_lang::prelude::*;


/*
* The user metadata
*/
#[account]
pub struct UserMetadata {
    pub username: String,
    pub ebucks_balance: u64,
    pub trade_count: u32,
    pub cashed_out: bool,
    pub authority: Pubkey,
}


impl UserMetadata {

    pub const ACCOUNT_SPAN: usize = 8 + 40 + 8 + 4 + 1;
    
    pub const SEED_PREFIX: &'static str = "user_metadata";

    pub fn new(
        username: String,
        ebucks_balance: u64,
        trade_count: u32,
        cashed_out: bool,
        authority: Pubkey,
    ) -> Self {

        UserMetadata {
            username,
            ebucks_balance,
            trade_count,
            cashed_out,
            authority,
        }
    }
}