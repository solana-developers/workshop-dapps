use anchor_lang::prelude::*;

pub mod instructions;

use instructions::*;


declare_id!("3ndBQedcoFTScsVJ8vNSHKpmh8UQQYMYQovqqnWPUbiK");


#[program]
pub mod solana_twitter {
    use super::*;

    pub fn create_user_account(
        ctx: Context<CreateUserAccount>, 
        handle: String,
        display_name: String,
    ) -> Result<()> {

        create_user_account::create_user_account(
            ctx, 
            handle,
            display_name
        )
    }

    pub fn modify_user_account(
        ctx: Context<ModifyUserAccount>, 
        handle: String,
        display_name: String,
        twitter_account_bump: u8,
    ) -> Result<()> {

        modify_user_account::modify_user_account(
            ctx, 
            handle,
            display_name,
            twitter_account_bump
        )
    }

    pub fn write_tweet(
        ctx: Context<WriteTweet>, 
        body: String,
        twitter_account_bump: u8,
    ) -> Result<()> {

        write_tweet::write_tweet(
            ctx, 
            body,
            twitter_account_bump,
        )
    }
}