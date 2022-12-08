use anchor_lang::prelude::*;


#[account]
pub struct Hero {
    pub bump: u8,
    pub id: Pubkey,
    pub icon: String,
    pub name: String,
    pub kills: u8,
    pub current_weapon: u8,
}


impl Hero {

    pub const INNER_DATA_SIZE: usize = 1    // .discriminator
        + 1     // bump
        + 32    // id
        + 24    // icon
        + 24    // name
        + 1;    // kills

    pub const TABLE_NAME: &'static str = "hero";

    pub fn new(
        bump: u8,
        id: Pubkey,
        icon: String,
        name: String,
        current_weapon: u8,
    ) -> Self {
        Hero {
            bump,
            id,
            icon,
            name,
            kills: 0,
            current_weapon,
        }
    }

    pub fn increment_kills(&mut self, fresh_kills: u8) {
        self.kills += fresh_kills;
    }
}