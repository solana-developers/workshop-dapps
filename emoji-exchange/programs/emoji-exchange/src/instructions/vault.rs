use anchor_lang::{
    AccountsClose,
    prelude::*,
    system_program,
};

use crate::state::Vault;


/*
* Creates a PDA for the store's vault.
*/
pub fn create_vault(
    _ctx: Context<CreateVault>,
) -> Result<()> {

    Ok(())
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(
        init, 
        payer = authority, 
        space = Vault::ACCOUNT_SPAN,
        seeds = [ 
            Vault::SEED_PREFIX.as_bytes().as_ref(), 
         ],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* Funds the store's vault.
*/
pub fn fund_vault(
    ctx: Context<FundVault>,
    lamports: u64,
) -> Result<()> {

    system_program::transfer(
        CpiContext::new(ctx.accounts.system_program.to_account_info(), system_program::Transfer {
            from: ctx.accounts.authority.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        }),
        lamports
    )
}

#[derive(Accounts)]
pub struct FundVault<'info> {
    #[account(
        mut, 
        has_one = authority,
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* Closes the vault account.
*/
pub fn close_vault(
    ctx: Context<CloseVault>,
) -> Result<()> {

    ctx.accounts.vault.close(
        ctx.accounts.authority.to_account_info()
    )
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}