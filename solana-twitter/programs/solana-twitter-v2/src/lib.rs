use anchor_lang::prelude::*;

use instructions::*;

pub mod instructions;
pub mod state;


declare_id!("8F4ess66QE6ZcLLttrRuvWvq41hYvUeu2oZ6TabQycKK");


#[program]
pub mod solana_twitter_v2 {
    use super::*;

    pub fn create_like_mint(
        ctx: Context<CreateLikeMint>, 
    ) -> Result<()> {

        instructions::create_mint::create_like_mint(
            ctx, 
        )
    }

    pub fn create_retweet_mint(
        ctx: Context<CreateRetweetMint>, 
    ) -> Result<()> {

        instructions::create_mint::create_retweet_mint(
            ctx, 
        )
    }

    pub fn create_profile(
        ctx: Context<CreateProfile>, 
        handle: String,
        display_name: String,
    ) -> Result<()> {

        instructions::create_profile::create_profile(
            ctx, 
            handle,
            display_name
        )
    }

    pub fn create_tweet(
        ctx: Context<CreateTweet>, 
        body: String,
    ) -> Result<()> {

        instructions::create_tweet::create_tweet(
            ctx, 
            body,
        )
    }

    pub fn create_like(
        ctx: Context<CreateLike>, 
    ) -> Result<()> {

        instructions::create_like::create_like(
            ctx, 
        )
    }

    pub fn create_retweet(
        ctx: Context<CreateRetweet>, 
    ) -> Result<()> {

        instructions::create_retweet::create_retweet(
            ctx, 
        )
    }
}