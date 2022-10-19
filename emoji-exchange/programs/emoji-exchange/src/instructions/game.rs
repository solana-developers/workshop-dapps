use {
    anchor_lang::{
        prelude::*,
        system_program,
    },
    anchor_spl::{
        associated_token,
        token,
    }
};

use crate::state::{
    Game,
    UserMetadata,
};


/*
* Creates a PDA for the game's status.
*/
pub fn create_game(
    ctx: Context<CreateGame>,
    prize: u64,
) -> Result<()> {

    ctx.accounts.game.set_inner(
        Game::new(
            prize, 
            ctx.accounts.authority.key(), 
            *ctx.bumps.get(Game::SEED_PREFIX).expect("Bump not found."),
        )
    );
    Ok(())
}

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init, 
        payer = authority, 
        space = Game::ACCOUNT_SPAN,
        seeds = [ 
            Game::SEED_PREFIX.as_bytes().as_ref(), 
        ],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}


/*
* Funds the game's vault token account with USDC.
*/
pub fn fund_vault_sol(
    ctx: Context<FundVaultSol>,
    amount: u64,
) -> Result<()> {

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.game.to_account_info(),
            },
        ),
        amount,
    )
}

#[derive(Accounts)]
pub struct FundVaultSol<'info> {
    #[account(
        mut,
        seeds = [
            Game::SEED_PREFIX.as_bytes().as_ref(),
        ],
        bump = game.bump,
        constraint = game.is_active == true,
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}


/*
* Funds the game's vault token account with USDC.
*/
pub fn fund_vault_usdc(
    ctx: Context<FundVaultUsdc>,
) -> Result<()> {

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.master_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        ctx.accounts.game.prize
    )
}

#[derive(Accounts)]
pub struct FundVaultUsdc<'info> {
    pub mint: Account<'info, token::Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = game,
    )]
    pub vault_token_account: Account<'info, token::TokenAccount>,
    #[account(
        mut,
        seeds = [
            Game::SEED_PREFIX.as_bytes().as_ref(),
        ],
        bump = game.bump,
        constraint = game.is_active == true,
    )]
    pub game: Account<'info, Game>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub master_token_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, token::Token>,
}


/*
* Claims the prize for a user and disables the game.
*/
pub fn claim_prize(
    ctx: Context<ClaimPrize>,
) -> Result<()> {

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.game.to_account_info(),
            },
            &[&[
                Game::SEED_PREFIX.as_bytes().as_ref(),
                &[ctx.accounts.game.bump]
            ]]
        ),
        ctx.accounts.game.prize
    )?;
    ctx.accounts.game.is_active = false;
    Ok(())
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    pub mint: Account<'info, token::Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = game,
    )]
    pub vault_token_account: Account<'info, token::TokenAccount>,
    #[account(
        mut,
        seeds = [
            Game::SEED_PREFIX.as_bytes().as_ref(),
        ],
        bump = game.bump,
        constraint = game.is_active == true,
    )]
    pub game: Account<'info, Game>,
    #[account(
        init_if_needed,
        payer = user_authority,
        associated_token::mint = mint,
        associated_token::authority = user_authority,
    )]
    pub user_token_account: Account<'info, token::TokenAccount>,
    #[account(
        mut,
        constraint = user_metadata.authority == user_authority.key(),
    )]
    pub user_metadata: Account<'info, UserMetadata>,
    #[account(mut)]
    pub user_authority: SystemAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}


/*
* Closes the game account.
*/
pub fn close_game(
    _ctx: Context<CloseGame>,
) -> Result<()> {

    Ok(())
}

#[derive(Accounts)]
pub struct CloseGame<'info> {
    #[account(
        mut,
        close = authority,
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}