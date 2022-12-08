use anchor_lang::{
    AccountsClose,
    prelude::*,
};

use crate::state::Magic;


pub fn create_magic(
    ctx: Context<CreateMagic>,
    id: u8,
    icon: String,
    magic_name: String,
    damage_increase: u8,
) -> Result<()> {

    ctx.accounts.magic.set_inner(
        Magic::new(
            *ctx.bumps.get(Magic::TABLE_NAME).expect("Bump not found."),
            id,
            icon,
            magic_name,
            damage_increase,
        )
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    id: u8,
    icon: String,
    magic_name: String,
    damage_increase: u8,
)]
pub struct CreateMagic<'info> {
    #[account(
        init,
        space = Magic::INNER_DATA_SIZE,
        payer = payer,
        seeds = [
            Magic::TABLE_NAME.as_bytes().as_ref(),
            id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    magic: Account<'info, Magic>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}


pub fn update_magic(
    ctx: Context<UpdateMagic>,
    id: u8,
    icon: String,
    magic_name: String,
    damage_increase: u8,
) -> Result<()> {

    assert!(id == ctx.accounts.magic.id);
    let magic = &mut ctx.accounts.magic;
    magic.icon = icon;
    magic.magic_name = magic_name;
    magic.damage_increase = damage_increase;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateMagic<'info> {
    #[account(
        mut,
        seeds = [
            Magic::TABLE_NAME.as_bytes().as_ref(),
            magic.id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    magic: Account<'info, Magic>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}


pub fn delete_magic(
    ctx: Context<DeleteMagic>,
    id: u8,
) -> Result<()> {

    assert!(id == ctx.accounts.magic.id);
    ctx.accounts.magic.close(ctx.accounts.payer.to_account_info())
}

#[derive(Accounts)]
pub struct DeleteMagic<'info> {
    #[account(
        mut,
        seeds = [
            Magic::TABLE_NAME.as_bytes().as_ref(),
            magic.id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    magic: Account<'info, Magic>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}