use anchor_lang::prelude::*;

use crate::state::Candidate;


pub fn cast_vote(
    ctx: Context<CastVote>,
) -> Result<()> {

    ctx.accounts.candidate_account.vote_count += 1;
    Ok(())
}


#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub candidate_account: Account<'info, Candidate>,
    #[account(mut)]
    pub payer: Signer<'info>, // Voter
    pub system_program: Program<'info, System>,
}