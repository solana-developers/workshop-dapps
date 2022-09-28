use anchor_lang::prelude::*;


#[account]
pub struct Candidate {
    pub candidate_id: u8,
    pub candidate_name: String,
    pub vote_count: u32,
    pub authority: Pubkey,
}


impl Candidate {

    pub const ACCOUNT_SPAN: usize = 8 + 120 + 32;
    
    pub const SEED_PREFIX: &'static str = "candidate";

    pub fn new(
        candidate_id: u8,
        candidate_name: String,
        vote_count: u32,
        authority: Pubkey,
    ) -> Self {

        Candidate {
            candidate_id,
            candidate_name,
            vote_count,
            authority,
        }
    }
}