use anchor_lang::prelude::*;

use instructions::*;

pub mod instructions;
pub mod state;


declare_id!("3ndBQedcoFTScsVJ8vNSHKpmh8UQQYMYQovqqnWPUbiK");


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

    pub fn create_retweet(
        ctx: Context<CreateRetweet>, 
    ) -> Result<()> {

        instructions::create_retweet::create_retweet(
            ctx, 
        )
    }
}