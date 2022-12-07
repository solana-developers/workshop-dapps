use anchor_lang::prelude::*;

use instructions::*;

pub mod instructions;
pub mod state;


declare_id!("3YvoWYBSgq1ge4wpopNXZbKjfQpcZ7Gkh4QWNMQddXiS");


#[program]
pub mod solana_twitter_v2 {
    use super::*;

    // Create Like Mint instruction
    //
    pub fn create_like_mint(
        ctx: Context<CreateLikeMint>, 
    ) -> Result<()> {

        // Calls 'create_like_mint' from instructions/create_like_mint.rs
        instructions::create_mint::create_like_mint(
            ctx, 
        )
    }

    // Create Retweet Mint instruction
    //
    pub fn create_retweet_mint(
        ctx: Context<CreateRetweetMint>, 
    ) -> Result<()> {

        // Calls 'create_retweet_mint' from instructions/create_retweet_mint.rs
        instructions::create_mint::create_retweet_mint(
            ctx, 
        )
    }
    
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