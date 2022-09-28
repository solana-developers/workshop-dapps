use anchor_lang::prelude::*;


/*
* The user emoji data
*/
#[account]
pub struct UserEmoji {
    pub emoji_name: String,
    pub display: String,
    pub balance: u8,
    pub cost_average: u64,
    pub authority: Pubkey,
}


impl UserEmoji {

    pub const ACCOUNT_SPAN: usize = 8 + 40 + 40 + 1 + 8;
    
    pub const SEED_PREFIX: &'static str = "user_emoji";

    pub fn new(
        emoji_name: String,
        display: String,
        balance: u8,
        cost_average: u64,
        authority: Pubkey,
    ) -> Self {

        UserEmoji {
            emoji_name,
            display,
            balance,
            cost_average,
            authority,
        }
    }
}