use anchor_lang::{
    AccountsClose,
    prelude::*,
};

use crate::state::EquippedMagic;


pub fn create_equipped_magic(
    ctx: Context<CreateEquippedMagic>,
    id: u8,
    hero_id: Pubkey,
    magic_id: u8,
) -> Result<()> {

    ctx.accounts.equipped_magic.set_inner(
        EquippedMagic::new(
            *ctx.bumps.get(EquippedMagic::TABLE_NAME).expect("Bump not found."),
            id,
            hero_id,
            magic_id,
        )
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    id: u8,
    hero_id: Pubkey,
    magic_id: u8,
)]
pub struct CreateEquippedMagic<'info> {
    #[account(
        init,
        space = EquippedMagic::INNER_DATA_SIZE,
        payer = payer,
        seeds = [
            EquippedMagic::TABLE_NAME.as_bytes().as_ref(),
            id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    equipped_magic: Account<'info, EquippedMagic>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}


pub fn update_equipped_magic(
    ctx: Context<UpdateEquippedMagic>,
    id: u8,
    hero_id: Pubkey,
    magic_id: u8,
) -> Result<()> {

    assert!(id == ctx.accounts.equipped_magic.id);
    let equipped_magic = &mut ctx.accounts.equipped_magic;
    equipped_magic.hero_id = hero_id;
    equipped_magic.magic_id = magic_id;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateEquippedMagic<'info> {
    #[account(
        mut,
        seeds = [
            EquippedMagic::TABLE_NAME.as_bytes().as_ref(),
            equipped_magic.id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    equipped_magic: Account<'info, EquippedMagic>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}


pub fn delete_equipped_magic(
    ctx: Context<DeleteEquippedMagic>,
    id: u8,
) -> Result<()> {

    assert!(id == ctx.accounts.equipped_magic.id);
    ctx.accounts.equipped_magic.close(ctx.accounts.payer.to_account_info())
}

#[derive(Accounts)]
pub struct DeleteEquippedMagic<'info> {
    #[account(
        mut,
        seeds = [
            EquippedMagic::TABLE_NAME.as_bytes().as_ref(),
            equipped_magic.id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    equipped_magic: Account<'info, EquippedMagic>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}