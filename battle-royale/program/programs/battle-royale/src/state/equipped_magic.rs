use anchor_lang::prelude::*;


#[account]
pub struct EquippedMagic {
    pub bump: u8,
    pub id: u8,
    pub hero_id: Pubkey,
    pub magic_id: u8,
}


impl EquippedMagic {

    pub const INNER_DATA_SIZE: usize = 8    // .discriminator
        + 1     // bump
        + 1     // id
        + 32    // hero_id
        + 1;    // magic_id

    pub const TABLE_NAME: &'static str = "equipped_magic";

    pub fn new(
        bump: u8,
        id: u8,
        hero_id: Pubkey,
        magic_id: u8,
    ) -> Self {
        EquippedMagic {
            bump,
            id,
            hero_id,
            magic_id,
        }
    }
}