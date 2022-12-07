use anchor_lang::prelude::*;

use instructions::*;

pub mod instructions;
pub mod state;


declare_id!("BnsBsM7xZ6XhxmiFXkMp8veyBnPdBkfauVcGfn9onzTk");


#[program]
pub mod solana_twitter_v1 {
    use super::*;

    // Create Profile instruction
    //
    pub fn create_profile(
        ctx: Context<CreateProfile>, 
        handle: String,
        display_name: String,
    ) -> Result<()> {

        // Calls 'create_profile' from instructions/create_profile.rs
        instructions::create_profile::create_profile(
            ctx, 
            handle,
            display_name
        )
    }

    // Create Tweet instruction
    //
    pub fn create_tweet(
        ctx: Context<CreateTweet>, 
        body: String,
    ) -> Result<()> {

        // Calls 'create_tweet' from instructions/create_tweet.rs
        instructions::create_tweet::create_tweet(
            ctx, 
            body,
        )
    }

    // Create Like instructions
    //
    pub fn create_like(
        ctx: Context<CreateLike>, 
    ) -> Result<()> {

        // Calls 'create_like' from instructions/create_like.rs
        instructions::create_like::create_like(
            ctx, 
        )
    }

    // Create Retweet instructions
    //
    pub fn create_retweet(
        ctx: Context<CreateRetweet>, 
    ) -> Result<()> {

        // Calls 'create_retweet' from instructions/create_retweet.rs
        instructions::create_retweet::create_retweet(
            ctx, 
        )
    }
}