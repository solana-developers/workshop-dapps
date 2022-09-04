use {
    anchor_lang::prelude::*,
    anchor_spl::{
        token,
        associated_token,
    },
};

use crate::state::LikeMintAuthorityPda;
use crate::state::RetweetMintAuthorityPda;
use crate::state::SolanaTwitterProfile;


pub fn create_profile(
    ctx: Context<CreateProfile>,
    handle: String,
    display_name: String,
) -> Result<()> {

    let profile = SolanaTwitterProfile::new(
        handle,
        display_name,
        ctx.accounts.authority.key(),
        *ctx.bumps.get(SolanaTwitterProfile::SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.profile.set_inner(profile.clone());
    Ok(())
}

#[derive(Accounts)]
pub struct CreateProfile<'info> {
    
    // We need the Mint & Mint Authority to derive the user's ATAs
    // Likes
    #[account(
        mut,
        seeds = [
            LikeMintAuthorityPda::MINT_SEED_PREFIX.as_bytes().as_ref()
        ],
        bump = like_mint_authority.mint_bump,
        mint::decimals = 9,
        mint::authority = like_mint_authority.key(),
    )]
    pub like_mint: Account<'info, token::Mint>,
    #[account(
        mut, 
        seeds = [
            LikeMintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
            like_mint.key().as_ref()
        ],
        bump = like_mint_authority.bump
    )]
    pub like_mint_authority: Account<'info, LikeMintAuthorityPda>,
    #[account(
        init,
        payer = authority,
        associated_token::mint = like_mint,
        associated_token::authority = authority,
    )]
    pub like_token_account: Account<'info, token::TokenAccount>,

    // Retweets
    #[account(
        mut,
        seeds = [
            RetweetMintAuthorityPda::MINT_SEED_PREFIX.as_bytes().as_ref()
        ],
        bump =retweet_mint_authority.mint_bump,
        mint::decimals = 9,
        mint::authority = retweet_mint_authority.key(),
    )]
    pub retweet_mint: Account<'info, token::Mint>,
    #[account(
        mut, 
        seeds = [
            RetweetMintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
            retweet_mint.key().as_ref()
        ],
        bump = retweet_mint_authority.bump
    )]
    pub retweet_mint_authority: Account<'info, RetweetMintAuthorityPda>,
    #[account(
        init,
        payer = authority,
        associated_token::mint = retweet_mint,
        associated_token::authority = authority,
    )]
    pub retweet_token_account: Account<'info, token::TokenAccount>,

    #[account(
        init,
        payer = authority,
        space = SolanaTwitterProfile::ACCOUNT_SPACE,
        seeds = [
            SolanaTwitterProfile::SEED_PREFIX.as_ref(),
            authority.key().as_ref(),
        ],
        bump
    )]
    pub profile: Account<'info, SolanaTwitterProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}
