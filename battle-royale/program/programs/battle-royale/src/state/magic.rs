use anchor_lang::prelude::*;


#[account]
pub struct Magic {
    pub bump: u8,
    pub id: u8,
    pub icon: String,
    pub magic_name: String,
    pub damage_increase: u8,
}


impl Magic {

    pub const INNER_DATA_SIZE: usize = 1    // .discriminator
        + 1     // bump
        + 1     // id
        + 24    // icon
        + 24    // magic_name
        + 1;    // damage_increase

    pub const TABLE_NAME: &'static str = "magic";

    pub fn new(
        bump: u8,
        id: u8,
        icon: String,
        magic_name: String,
        damage_increase: u8,
    ) -> Self {
        Magic {
            bump,
            id,
            icon,
            magic_name,
            damage_increase,
        }
    }
}