use anchor_lang::prelude::*;

use crate::state::Candidate;


pub fn create_candidate(
    ctx: Context<CreateCandidate>,
    candidate_id: u8,
    name: String,
) -> Result<()> {

    ctx.accounts.candidate_account.set_inner(
        Candidate::new(
            candidate_id,
            name,
            0,
            ctx.accounts.authority.key(),
        )
    );
    Ok(())
}


#[derive(Accounts)]
#[instruction(
    candidate_id: u8,
    name: String,
)]
pub struct CreateCandidate<'info> {
    #[account(
        init,
        payer = authority,
        space = Candidate::ACCOUNT_SPAN,
        seeds = [
            Candidate::SEED_PREFIX.as_bytes().as_ref(),
            candidate_id.to_string().as_ref(),
        ],
        bump,
    )]
    pub candidate_account: Account<'info, Candidate>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}