use anchor_lang::prelude::*;


#[account]
pub struct MintAuthorityPda {
    pub bump: u8,
}

impl MintAuthorityPda {
    pub const ACCOUNT_SPACE: usize = 8 + 8;
    pub const SEED_PREFIX: &'static str = "mint_authority";

    pub fn new(
        bump: u8,
    ) -> Self {
        return MintAuthorityPda { 
            bump,
        }
    }
}
