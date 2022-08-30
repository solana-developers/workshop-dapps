use anchor_lang::prelude::*;

use crate::state::SolanaTwitterProfile;


pub fn modify_profile(
    ctx: Context<ModifyProfile>,
    handle: String,
    display_name: String,
) -> Result<()> {

    msg!("Modifying profile...");
    msg!("  Profile address: {}", ctx.accounts.profile.key());
    let existing_profile = &mut ctx.accounts.profile;
    existing_profile.handle = handle;
    existing_profile.display_name = display_name;
    msg!("Profile updated successfully.");
    Ok(())
}

#[derive(Accounts)]
pub struct ModifyProfile<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [
            SolanaTwitterProfile::SEED_PREFIX.as_ref(),
            authority.key().as_ref(),
        ],
        bump = profile.bump
    )]
    pub profile: Account<'info, SolanaTwitterProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
