use anchor_lang::prelude::*;

use crate::state::MintAuthorityPda;


pub fn init(
    ctx: Context<InitNftMinting>
) -> Result<()> {
    
    let mint_authority = MintAuthorityPda::new(
        *ctx.bumps
            .get(MintAuthorityPda::SEED_PREFIX)
            .expect("Bump not found.")
    );
    ctx.accounts.mint_authority.set_inner(mint_authority.clone());
    Ok(())
}

#[derive(Accounts)]
pub struct InitNftMinting<'info> {
    #[account(
        init, 
        payer = payer,
        space = 8 + 32,
        seeds = [
            MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
        ],
        bump
    )]
    pub mint_authority: Account<'info, MintAuthorityPda>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}