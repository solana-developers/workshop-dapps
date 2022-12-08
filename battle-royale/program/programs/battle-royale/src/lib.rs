pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

use instructions::*;
use state::WeaponType;


declare_id!("8LhtRoYDBrzaYZu91NA45mQipxiXBx9cx1iSy1B6Eu5W");


#[program]
pub mod battle_royale {
    use super::*;

    // Hero

    pub fn create_hero(
        ctx: Context<CreateHero>,
        id: Pubkey,
        icon: String,
        name: String,
        current_weapon: u8,
    ) -> Result<()> {
        instructions::create_hero(
            ctx,
            id,
            icon,
            name,
            current_weapon,
        )
    }

    pub fn update_hero(
        ctx: Context<UpdateHero>,
        id: Pubkey,
        icon: String,
        name: String,
        kills: u8,
        current_weapon: u8,
    ) -> Result<()> {
        instructions::update_hero(
            ctx,
            id,
            icon,
            name,
            kills,
            current_weapon,
        )
    }

    pub fn delete_hero(
        ctx: Context<DeleteHero>,
        id: Pubkey,
    ) -> Result<()> {
        instructions::delete_hero(
            ctx,
            id,
        )
    }

    // Equipped Magic

    pub fn create_equipped_magic(
        ctx: Context<CreateEquippedMagic>,
        id: u8,
        hero_id: Pubkey,
        magic_id: u8,
    ) -> Result<()> {
        instructions::create_equipped_magic(
            ctx,
            id,
            hero_id,
            magic_id,
        )
    }

    pub fn update_equipped_magic(
        ctx: Context<UpdateEquippedMagic>,
        id: u8,
        hero_id: Pubkey,
        magic_id: u8,
    ) -> Result<()> {
        instructions::update_equipped_magic(
            ctx,
            id,
            hero_id,
            magic_id,
        )
    }

    pub fn delete_equipped_magic(
        ctx: Context<DeleteEquippedMagic>,
        id: u8,
    ) -> Result<()> {
        instructions::delete_equipped_magic(
            ctx,
            id,
        )
    }

    // Magic

    pub fn create_magic(
        ctx: Context<CreateMagic>,
        id: u8,
        icon: String,
        magic_name: String,
        damage_increase: u8,
    ) -> Result<()> {
        instructions::create_magic(
            ctx,
            id,
            icon,
            magic_name,
            damage_increase,
        )
    }

    pub fn update_magic(
        ctx: Context<UpdateMagic>,
        id: u8,
        icon: String,
        magic_name: String,
        damage_increase: u8,
    ) -> Result<()> {
        instructions::update_magic(
            ctx,
            id,
            icon,
            magic_name,
            damage_increase,
        )
    }

    pub fn delete_magic(
        ctx: Context<DeleteMagic>,
        id: u8,
    ) -> Result<()> {
        instructions::delete_magic(
            ctx,
            id,
        )
    }

    // Weapon

    pub fn create_weapon(
        ctx: Context<CreateWeapon>,
        id: u8,
        icon: String,
        weapon_name: String,
        weapon_type: WeaponType,
        damage: u32,
    ) -> Result<()> {
        instructions::create_weapon(
            ctx,
            id,
            icon,
            weapon_name,
            weapon_type,
            damage,
        )
    }

    pub fn update_weapon(
        ctx: Context<UpdateWeapon>,
        id: u8,
        icon: String,
        weapon_name: String,
        weapon_type: WeaponType,
        damage: u32,
    ) -> Result<()> {
        instructions::update_weapon(
            ctx,
            id,
            icon,
            weapon_name,
            weapon_type,
            damage,
        )
    }

    pub fn delete_weapon(
        ctx: Context<DeleteWeapon>,
        id: u8,
    ) -> Result<()> {
        instructions::delete_weapon(
            ctx, 
            id
        )
    }
}