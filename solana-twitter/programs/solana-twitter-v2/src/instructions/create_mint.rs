use {
    anchor_lang::{
        prelude::*,
        solana_program::program::invoke_signed,
    },
    anchor_spl::token,
    mpl_token_metadata::instruction as mpl_instruction,
};

use crate::state::LikeMintAuthorityPda;
use crate::state::LikeMintMetadata;
use crate::state::RetweetMintAuthorityPda;
use crate::state::RetweetMintMetadata;


pub fn create_like_mint(
    ctx: Context<CreateLikeMint>
) -> Result<()> {

    invoke_signed(
        &mpl_instruction::create_metadata_accounts_v2(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.like_metadata.key(),
            ctx.accounts.like_mint.key(),
            ctx.accounts.like_mint_authority.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.like_mint_authority.key(),
            LikeMintMetadata::TITLE.to_string(),
            LikeMintMetadata::SYMBOL.to_string(),
            LikeMintMetadata::URI.to_string(),
            None,
            0,
            true,
            false,
            None,
            None,
        ),
        &[
            ctx.accounts.like_metadata.to_account_info(),
            ctx.accounts.like_mint.to_account_info(),
            ctx.accounts.like_mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.like_mint_authority.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        &[
            &[
                LikeMintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
                ctx.accounts.like_mint.key().as_ref(),
                &[*ctx.bumps.get(LikeMintAuthorityPda::SEED_PREFIX).expect("Bump not found.")],
            ]
        ]
    )?;

    let like_mint_authority = LikeMintAuthorityPda::new(
        *ctx.bumps.get(LikeMintAuthorityPda::SEED_PREFIX).expect("Bump not found."),
        *ctx.bumps.get(LikeMintAuthorityPda::MINT_SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.like_mint_authority.set_inner(like_mint_authority.clone());

    Ok(())
}

#[derive(Accounts)]
pub struct CreateLikeMint<'info> {
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub like_metadata: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        seeds = [
            LikeMintAuthorityPda::MINT_SEED_PREFIX.as_bytes().as_ref()
        ],
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
    /// CHECK: Metaplex will check this
    pub token_metadata_program: UncheckedAccount<'info>,
}


pub fn create_retweet_mint(
    ctx: Context<CreateRetweetMint>
) -> Result<()> {

    invoke_signed(
        &mpl_instruction::create_metadata_accounts_v2(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.retweet_metadata.key(),
            ctx.accounts.retweet_mint.key(),
            ctx.accounts.retweet_mint_authority.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.retweet_mint_authority.key(),
            RetweetMintMetadata::TITLE.to_string(),
            RetweetMintMetadata::SYMBOL.to_string(),
            RetweetMintMetadata::URI.to_string(),
            None,
            0,
            true,
            false,
            None,
            None,
        ),
        &[
            ctx.accounts.retweet_metadata.to_account_info(),
            ctx.accounts.retweet_mint.to_account_info(),
            ctx.accounts.retweet_mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.retweet_mint_authority.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        &[
            &[
                RetweetMintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
                ctx.accounts.retweet_mint.key().as_ref(),
                &[*ctx.bumps.get(RetweetMintAuthorityPda::SEED_PREFIX).expect("Bump not found.")],
            ]
        ]
    )?;

    let retweet_mint_authority = RetweetMintAuthorityPda::new(
        *ctx.bumps.get(RetweetMintAuthorityPda::SEED_PREFIX).expect("Bump not found."),
        *ctx.bumps.get(RetweetMintAuthorityPda::MINT_SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.retweet_mint_authority.set_inner(retweet_mint_authority.clone());

    Ok(())
}

#[derive(Accounts)]
pub struct CreateRetweetMint<'info> {
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub retweet_metadata: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        seeds = [
            RetweetMintAuthorityPda::MINT_SEED_PREFIX.as_bytes().as_ref()
        ],
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
    /// CHECK: Metaplex will check this
    pub token_metadata_program: UncheckedAccount<'info>,
}
