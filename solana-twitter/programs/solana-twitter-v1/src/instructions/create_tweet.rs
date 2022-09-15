use anchor_lang::prelude::*;

use crate::state::SolanaTwitterProfile;
use crate::state::SolanaTweet;


pub fn create_tweet(
    ctx: Context<CreateTweet>,
    body: String,
) -> Result<()> {


    Ok(())
}

#[derive(Accounts)]
pub struct CreateTweet<'info> {

}