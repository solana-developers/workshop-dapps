use anchor_lang::{
    AccountsClose,
    prelude::*,
};

use crate::state::{ Weapon, WeaponType };


pub fn create_weapon(
    ctx: Context<CreateWeapon>,
    id: u8,
    icon: String,
    weapon_name: String,
    weapon_type: WeaponType,
    damage: u32,
) -> Result<()> {

    ctx.accounts.weapon.set_inner(
        Weapon::new(
            *ctx.bumps.get(Weapon::TABLE_NAME).expect("Bump not found."),
            id,
            icon,
            weapon_name,
            weapon_type,
            damage,
        )
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    id: u8,
    icon: String,
    weapon_name: String,
    weapon_type: WeaponType,
    damage: u8,
)]
pub struct CreateWeapon<'info> {
    #[account(
        init,
        space = Weapon::INNER_DATA_SIZE,
        payer = payer,
        seeds = [
            Weapon::TABLE_NAME.as_bytes().as_ref(),
            id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    weapon: Account<'info, Weapon>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}


pub fn update_weapon(
    ctx: Context<UpdateWeapon>,
    id: u8,
    icon: String,
    weapon_name: String,
    weapon_type: WeaponType,
    damage: u32,
) -> Result<()> {

    assert!(id == ctx.accounts.weapon.id);
    let weapon = &mut ctx.accounts.weapon;
    weapon.icon = icon;
    weapon.weapon_name = weapon_name;
    weapon.weapon_type = weapon_type;
    weapon.damage = damage;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateWeapon<'info> {
    #[account(
        mut,
        seeds = [
            Weapon::TABLE_NAME.as_bytes().as_ref(),
            weapon.id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    weapon: Account<'info, Weapon>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}


pub fn delete_weapon(
    ctx: Context<DeleteWeapon>,
    id: u8,
) -> Result<()> {

    assert!(id == ctx.accounts.weapon.id);
    ctx.accounts.weapon.close(ctx.accounts.payer.to_account_info())
}

#[derive(Accounts)]
pub struct DeleteWeapon<'info> {
    #[account(
        mut,
        seeds = [
            Weapon::TABLE_NAME.as_bytes().as_ref(),
            weapon.id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    weapon: Account<'info, Weapon>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}