use anchor_lang::{
    AccountsClose,
    prelude::*,
    system_program,
};


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
        payer = store_wallet, 
        space = 8,
        seeds = [ b"vault" ],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* Funds the store's vault.
*/
pub fn fund_vault(
    ctx: Context<FundVault>,
    _vault_bump: u8,
    lamports: u64,
) -> Result<()> {

    msg!("Funding vault with {} lamports...", lamports);
    system_program::transfer(
        CpiContext::new(ctx.accounts.system_program.to_account_info(), system_program::Transfer {
            from: ctx.accounts.store_wallet.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        }),
        lamports
    )
}

#[derive(Accounts)]
#[instruction(
    vault_bump: u8,
    lamports: u64,
)]
pub struct FundVault<'info> {
    #[account(
        mut, 
        seeds = [ b"vault" ],
        bump = vault_bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/*
* Closes the vault account.
*/
pub fn close_vault(
    ctx: Context<CloseVault>,
) -> Result<()> {

    let vault = &mut ctx.accounts.vault;
    vault.close(ctx.accounts.store_wallet.to_account_info())
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub store_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {}