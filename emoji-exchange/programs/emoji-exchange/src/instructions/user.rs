use anchor_lang::prelude::*;

use crate::state::{ 
    StoreEmoji, 
    UserEmoji, 
    UserMetadata,
};


/*
* Creates account PDA for a user.
*/
pub fn create_user_metadata(
    ctx: Context<CreateUserMetadata>,
    username: String,
    initial_ebucks: u64,
) -> Result<()> {

    ctx.accounts.user_metadata.set_inner(
        UserMetadata::new(
            username,
            initial_ebucks,
            0,
            ctx.accounts.authority.key(),
        )
    );
    Ok(())
}

#[derive(Accounts)]
pub struct CreateUserMetadata<'info> {
    #[account(
        init, 
        payer = authority, 
        space = UserMetadata::ACCOUNT_SPAN,
        seeds = [
            UserMetadata::SEED_PREFIX.as_bytes().as_ref(), 
            authority.key.as_ref(),
        ],
        bump
    )]
    pub user_metadata: Account<'info, UserMetadata>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}


/*
* Closes a user account account.
*/
pub fn close_user_metadata(
    _ctx: Context<CloseUserMetadata>,
) -> Result<()> {

    Ok(())
}

#[derive(Accounts)]
pub struct CloseUserMetadata<'info> {
    #[account(
        mut,
        close = store_wallet,
    )]
    pub user_metadata: Account<'info, UserMetadata>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}


/*
* Creates an emoji PDA for a user.
*/
pub fn create_user_emoji(
    ctx: Context<CreateUserEmoji>,
    _emoji_seed: String,
) -> Result<()> {

    ctx.accounts.user_emoji.set_inner(
        UserEmoji::new(
            ctx.accounts.store_emoji.emoji_name.clone(),
            ctx.accounts.store_emoji.display.clone(),
            0,
            0,
            ctx.accounts.authority.key(),
        )
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    emoji_seed: String,
)]
pub struct CreateUserEmoji<'info> {
    #[account(mut)]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(
        init, 
        payer = authority, 
        space = UserEmoji::ACCOUNT_SPAN,
        seeds = [
            UserEmoji::SEED_PREFIX.as_bytes().as_ref(), 
            emoji_seed.as_bytes(), 
            authority.key.as_ref(),
        ],
        bump
    )]
    pub user_emoji: Account<'info, UserEmoji>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}


/*
* Closes a user emoji account.
*/
pub fn close_user_emoji(
    _ctx: Context<CloseUserEmoji>,
) -> Result<()> {

    Ok(())
}

#[derive(Accounts)]
pub struct CloseUserEmoji<'info> {
    #[account(
        mut,
        close = store_wallet,
    )]
    pub user_emoji: Account<'info, UserEmoji>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}