use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::*;


declare_id!("2cXGBhMQmtDzQdPitek7CaJKXwZmcehVc6FpiovtKsQq");


#[program]
pub mod voting_program {
    use super::*;

    pub fn create_candidate(
        ctx: Context<CreateCandidate>,
        candidate_id: u8,
        candidate_name: String,
    ) -> Result<()> {

        create_candidate::create_candidate(
            ctx, 
            candidate_id, 
            candidate_name
        )
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
    ) -> Result<()> {

        cast_vote::cast_vote(
            ctx, 
        )
    }
}


