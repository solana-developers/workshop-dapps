use {
    anchor_lang::prelude::*,
    anchor_spl::{
        token,
        associated_token,
    },
};

use crate::state::LikeMintAuthorityPda;
use crate::state::LikeMintMetadata;
use crate::state::RetweetMintAuthorityPda;
use crate::state::RetweetMintMetadata;


pub fn create_like_mint(
    ctx: Context<CreateLikeMint>
) -> Result<()> {

    let like_mint_authority = LikeMintAuthorityPda::new(
        *ctx.bumps.get(LikeMintAuthorityPda::SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.like_mint_authority.set_inner(like_mint_authority.clone());
    Ok(())
}

#[derive(Accounts)]
pub struct CreateLikeMint<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [LikeMintAuthorityPda::MINT_SEED_PREFIX.as_bytes().as_ref() ],
        bump,
        mint::decimals = 9,
        mint::authority = like_mint_authority.key(),
    )]
    pub like_mint: Account<'info, token::Mint>,
    #[account(
        init, 
        payer = payer,
        space = LikeMintAuthorityPda::ACCOUNT_SPACE,
        seeds = [
            LikeMintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
            like_mint.key().as_ref()
        ],
        bump
    )]
    pub like_mint_authority: Account<'info, LikeMintAuthorityPda>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
}


pub fn create_retweet_mint(
    ctx: Context<CreateRetweetMint>
) -> Result<()> {

    let retweet_mint_authority = RetweetMintAuthorityPda::new(
        *ctx.bumps.get(RetweetMintAuthorityPda::SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.retweet_mint_authority.set_inner(retweet_mint_authority.clone());
    Ok(())
}

#[derive(Accounts)]
pub struct CreateRetweetMint<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [RetweetMintAuthorityPda::MINT_SEED_PREFIX.as_bytes().as_ref() ],
        bump,
        mint::decimals = 9,
        mint::authority = retweet_mint_authority.key(),
    )]
    pub retweet_mint: Account<'info, token::Mint>,
    #[account(
        init, 
        payer = payer,
        space = RetweetMintAuthorityPda::ACCOUNT_SPACE,
        seeds = [
            RetweetMintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
            retweet_mint.key().as_ref()
        ],
        bump
    )]
    pub retweet_mint_authority: Account<'info, RetweetMintAuthorityPda>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
}