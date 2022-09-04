use anchor_lang::prelude::*;
use anchor_spl::token;

use crate::state::RetweetMintAuthorityPda;
use crate::state::SolanaRetweet;
use crate::state::SolanaTweet;
use crate::state::SolanaTwitterProfile;


pub fn create_retweet(
    ctx: Context<CreateRetweet>,
) -> Result<()> {

    let tweet = &mut ctx.accounts.tweet;
    let retweet = SolanaRetweet::new(
        ctx.accounts.authority.key(),
        ctx.accounts.submitter_profile.key(),
        tweet.key(),
        ctx.accounts.authority.key(),
        *ctx.bumps.get(SolanaRetweet::SEED_PREFIX).expect("Bump not found."),
    );
    ctx.accounts.retweet.set_inner(retweet.clone());
    tweet.retweet_count += 1;

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.retweet_mint.to_account_info(),
                to: ctx.accounts.author_token_account.to_account_info(),
                authority: ctx.accounts.retweet_mint_authority.to_account_info(),
            },
            &[&[
                RetweetMintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
                ctx.accounts.retweet_mint.key().as_ref(),
                &[ctx.accounts.retweet_mint_authority.bump],
            ]]
        ),
        1,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateRetweet<'info> {

    // We're essentially airdropping "Retweet" tokens to the
    //      original tweet author every time someone retweets.
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
        mut,
        associated_token::mint = retweet_mint,
        associated_token::authority = author_wallet,
    )]
    pub author_token_account: Account<'info, token::TokenAccount>,

    // We still use a PDA to store the public keys in a retweet
    #[account(
        init,
        payer = authority,
        space = SolanaRetweet::ACCOUNT_SPACE,
        seeds = [
            SolanaRetweet::SEED_PREFIX.as_bytes().as_ref(),
            submitter_profile.key().as_ref(),
            tweet.key().as_ref(),
        ],
        bump
    )]
    pub retweet: Account<'info, SolanaRetweet>,
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

