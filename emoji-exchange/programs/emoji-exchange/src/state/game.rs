use anchor_lang::prelude::*;


/*
* The game's status
*/
#[account]
pub struct Game {
    pub is_active: bool,
    pub prize: u64,
    pub authority: Pubkey,
    pub bump: u8,
}


impl Game {

    pub const ACCOUNT_SPAN: usize = 8 + 1 + 8 + 32 + 1;
    
    pub const SEED_PREFIX: &'static str = "game";

    pub fn new(
        prize: u64,
        authority: Pubkey,
        bump: u8,
    ) -> Self {

        Game {
            is_active: true,
            prize,
            authority,
            bump,
        }
    }
}