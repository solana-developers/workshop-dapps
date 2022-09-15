use anchor_lang::prelude::*;

use crate::state::SolanaTwitterProfile;


pub fn create_profile(
    ctx: Context<CreateProfile>,
    handle: String,
    display_name: String,
) -> Result<()> {


    Ok(())
}

#[derive(Accounts)]
pub struct CreateProfile<'info> {

}

