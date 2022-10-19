use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::*;


declare_id!("BEyDk9E6jDjPAW4euLgNAr6jgetTjHR4F4zpn5NcZh6X");


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


