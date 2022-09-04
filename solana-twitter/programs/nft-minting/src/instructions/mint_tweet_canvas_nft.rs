use {
    anchor_lang::{
        prelude::*,
        solana_program::program::invoke_signed,
    },
    anchor_spl::{
        associated_token,
        token,
    },
    mpl_token_metadata::instruction as mpl_instruction,
};

use crate::state::MintAuthorityPda;


pub fn mint_tweet_canvas_nft(
    ctx: Context<MintTweetCanvasNft>,
    metadata_title: String,
    metadata_symbol: String,
    metadata_uri: String,
) -> Result<()> {

    let mint_authority_pda_bump = *ctx.bumps
        .get(MintAuthorityPda::SEED_PREFIX)
        .expect("Bump not found.");
    
    let mint_authority = MintAuthorityPda::new(
        mint_authority_pda_bump
    );
    ctx.accounts.mint_authority.set_inner(mint_authority.clone());

    // invoke_signed(
    //     &mpl_instruction::create_metadata_accounts_v2(
    //         ctx.accounts.token_metadata_program.key(),
    //         ctx.accounts.metadata_account.key(),
    //         ctx.accounts.mint_account.key(),
    //         ctx.accounts.mint_authority.key(),
    //         ctx.accounts.payer.key(),
    //         ctx.accounts.mint_authority.key(),
    //         metadata_title,
    //         metadata_symbol,
    //         metadata_uri,
    //         None,
    //         0,
    //         true,
    //         false,
    //         None,
    //         None,
    //     ),
    //     &[
    //         ctx.accounts.metadata_account.to_account_info(),
    //         ctx.accounts.mint_account.to_account_info(),
    //         ctx.accounts.mint_authority.to_account_info(),
    //         ctx.accounts.payer.to_account_info(),
    //         ctx.accounts.mint_authority.to_account_info(),
    //         ctx.accounts.rent.to_account_info(),
    //     ],
    //     &[
    //         &[
    //             MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
    //             ctx.accounts.mint_account.key().as_ref(),
    //             &[mint_authority_pda_bump],
    //         ]
    //     ]
    // )?;

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            &[&[
                MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
                ctx.accounts.mint_account.key().as_ref(),
                &[mint_authority_pda_bump],
            ]]
        ),
        1,
    )?;

    // token::set_authority(
    //     CpiContext::new_with_signer(
    //         ctx.accounts.token_program.to_account_info(),
    //         token::SetAuthority {
    //             current_authority: ctx.accounts.mint_authority.to_account_info(),
    //             account_or_mint: ctx.accounts.mint_account.to_account_info(),
    //         },
    //         &[&[
    //             MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
    //             ctx.accounts.mint_account.key().as_ref(),
    //             &[mint_authority_pda_bump],
    //         ]]
    //     ),
    // )?;

    Ok(())
}

#[derive(Accounts)]
pub struct MintTweetCanvasNft<'info> {
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority.key(),
    )]
    pub mint_account: Account<'info, token::Mint>,
    #[account(
        init, 
        payer = payer,
        space = 8 + 32,
        seeds = [
            MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
            mint_account.key().as_ref(),
        ],
        bump
    )]
    pub mint_authority: Account<'info, MintAuthorityPda>,
    /// CHECK: This is for airdrops
    pub recipient: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    /// CHECK: Metaplex will check this
    pub token_metadata_program: UncheckedAccount<'info>,
}
