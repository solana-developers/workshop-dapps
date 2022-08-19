use anchor_lang::prelude::*;

use instructions::*;

pub mod instructions;
pub mod state;


declare_id!("CbD6Z9S63vvQqfM88QcDLrYVLKuBkHtCGcifKpeS2Dir");


#[program]
pub mod solana_twitter {
    use super::*;

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

    pub fn modify_profile(
        ctx: Context<ModifyProfile>, 
        handle: String,
        display_name: String,
    ) -> Result<()> {

        instructions::modify_profile::modify_profile(
            ctx, 
            handle,
            display_name,
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

    pub fn create_like_mint(
        ctx: Context<CreateLikeMint>, 
    ) -> Result<()> {

        instructions::create_mint::create_like_mint(
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

    pub fn create_retweet_mint(
        ctx: Context<CreateRetweetMint>, 
    ) -> Result<()> {

        instructions::create_mint::create_retweet_mint(
            ctx, 
        )
    }
}