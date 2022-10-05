use anchor_lang::{
    AccountsClose,
    prelude::*,
    system_program,
};

use crate::state::{ 
    StoreEmoji, 
    UserEmoji, 
    UserMetadata,
    Vault,
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
            false,
            ctx.accounts.authority.key(),
        )
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    username: String,
    initial_ebucks: u64,
)]
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
* Marks a user as cashed out by updating their account.
*/
pub fn cash_out_user(
    ctx: Context<CashOutUser>,
    amount: u64,
    vault_bump: u8,
) -> Result<()> {

    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.authority.to_account_info(),
            },
            &[&[
                Vault::SEED_PREFIX.as_bytes().as_ref(),
                &[vault_bump],
            ]]
        ),
        amount
    )?;
    ctx.accounts.user_metadata.cashed_out = true;
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    amount: u64,
    vault_bump: u8,
)]
pub struct CashOutUser<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub user_metadata: Account<'info, UserMetadata>,
    #[account(mut)]
    pub authority: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [
            Vault::SEED_PREFIX.as_bytes().as_ref(),
        ],
        bump = vault_bump,
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}


/*
* Closes a user account account.
*/
pub fn close_user_metadata(
    ctx: Context<CloseUserMetadata>,
) -> Result<()> {

    ctx.accounts.user_metadata.close(
        ctx.accounts.store_wallet.to_account_info()
    )
}

#[derive(Accounts)]
pub struct CloseUserMetadata<'info> {
    #[account(mut)]
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
    ctx: Context<CloseUserEmoji>,
) -> Result<()> {

    ctx.accounts.user_emoji.close(
        ctx.accounts.store_wallet.to_account_info()
    )
}

#[derive(Accounts)]
pub struct CloseUserEmoji<'info> {
    #[account(mut)]
    pub user_emoji: Account<'info, UserEmoji>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}