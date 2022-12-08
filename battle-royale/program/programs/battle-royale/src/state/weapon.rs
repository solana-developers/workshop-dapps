use anchor_lang::prelude::*;


#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum WeaponType {
    Dagger,
    Hammer,
    Pistol,
    Sword,
}

#[account]
pub struct Weapon {
    pub bump: u8,
    pub id: u8,
    pub icon: String,
    pub weapon_name: String,
    pub weapon_type: WeaponType,
    pub damage: u32,
}


impl Weapon {

    pub const INNER_DATA_SIZE: usize = 1    // .discriminator
        + 1     // bump
        + 1     // id
        + 24    // icon
        + 24    // weapon_name
        + 1     // weapon_type
        + 4;    // damage

    pub const TABLE_NAME: &'static str = "weapon";

    pub fn new(
        bump: u8,
        id: u8,
        icon: String,
        weapon_name: String,
        weapon_type: WeaponType,
        damage: u32,
    ) -> Self {
        Weapon {
            bump,
            id,
            icon,
            weapon_name,
            weapon_type,
            damage,
        }
    }
}