use anchor_lang::prelude::*;
use anchor_spl::token;

use crate::state::LikeMintAuthorityPda;
use crate::state::SolanaLike;
use crate::state::SolanaTweet;
use crate::state::SolanaTwitterProfile;


pub fn create_like(
    ctx: Context<CreateLike>,
) -> Result<()> {

    let tweet = &mut ctx.accounts.tweet;
    let like = SolanaLike::new(
        ctx.accounts.authority.key(),
        ctx.accounts.submitter_profile.key(),
        tweet.key(),
        ctx.accounts.authority.key(),
        *ctx.bumps.get(SolanaLike::SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.like.set_inner(like.clone());
    tweet.like_count += 1;

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.like_mint.to_account_info(),
                to: ctx.accounts.author_token_account.to_account_info(),
                authority: ctx.accounts.like_mint_authority.to_account_info(),
            },
            &[&[
                LikeMintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
                ctx.accounts.like_mint.key().as_ref(),
                &[ctx.accounts.like_mint_authority.bump],
            ]]
        ),
        1,
    )?;
    
    Ok(())
}

#[derive(Accounts)]
pub struct CreateLike<'info> {

    // We're essentially airdropping "Like" tokens to the
    //      original tweet author every time someone likes.
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
        mut,
        associated_token::mint = like_mint,
        associated_token::authority = author_wallet,
    )]
    pub author_token_account: Account<'info, token::TokenAccount>,

    // We still use a PDA to store the public keys in a like
    #[account(
        init,
        payer = authority,
        space = SolanaLike::ACCOUNT_SPACE,
        seeds = [
            SolanaLike::SEED_PREFIX.as_bytes().as_ref(),
            submitter_profile.key().as_ref(),
            tweet.key().as_ref(),
        ],
        bump
    )]
    pub like: Account<'info, SolanaLike>,
    #[account(
        mut,
        seeds = [
            SolanaTweet::SEED_PREFIX.as_ref(),
            tweet.profile_pubkey.as_ref(),
            tweet.tweet_number.to_string().as_ref(),
        ],
        bump = tweet.bump,
    )]
    pub tweet: Account<'info, SolanaTweet>,
    #[account(
        mut,
        has_one = authority,
        seeds = [
            SolanaTwitterProfile::SEED_PREFIX.as_ref(),
            authority.key().as_ref(),
        ],
        bump = submitter_profile.bump,
    )]
    pub submitter_profile: Account<'info, SolanaTwitterProfile>,

    /// CHECK: This is for airdrops
    pub author_wallet: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
}

