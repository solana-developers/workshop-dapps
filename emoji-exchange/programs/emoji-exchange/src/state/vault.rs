use anchor_lang::prelude::*;


/*
* The game's payout vault
*/
#[account]
pub struct Vault {
    pub authority: Pubkey,
}


impl Vault {

    pub const ACCOUNT_SPAN: usize = 8 + 32;
    
    pub const SEED_PREFIX: &'static str = "vault";

    pub fn new(
        authority: Pubkey,
    ) -> Self {

        Vault {
            authority,
        }
    }
}