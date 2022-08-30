use anchor_lang::prelude::*;

use crate::state::SolanaTwitterProfile;


pub fn create_profile(
    ctx: Context<CreateProfile>,
    handle: String,
    display_name: String,
) -> Result<()> {

    msg!("Creating new profile...");
    let profile = SolanaTwitterProfile::new(
        handle,
        display_name,
        ctx.accounts.authority.key(),
        *ctx.bumps.get(SolanaTwitterProfile::SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.profile.set_inner(profile.clone());
    msg!("Profile created successfully.");
    Ok(())
}

#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(
        init,
        payer = authority,
        space = SolanaTwitterProfile::ACCOUNT_SPACE,
        seeds = [
            SolanaTwitterProfile::SEED_PREFIX.as_ref(),
            authority.key().as_ref(),
        ],
        bump
    )]
    pub profile: Account<'info, SolanaTwitterProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

