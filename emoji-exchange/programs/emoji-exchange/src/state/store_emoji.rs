use anchor_lang::prelude::*;


/*
* The store emoji data
*/
#[account]
pub struct StoreEmoji {
    pub emoji_name: String,
    pub display: String,
    pub balance: u8,
    pub price: u64,
    pub authority: Pubkey,
}


impl StoreEmoji {

    pub const ACCOUNT_SPAN: usize = 8 + 40 + 40 + 1 + 8;
    
    pub const SEED_PREFIX: &'static str = "store_emoji";

    pub fn new(
        emoji_name: String,
        display: String,
        balance: u8,
        price: u64,
        authority: Pubkey,
    ) -> Self {

        StoreEmoji {
            emoji_name,
            display,
            balance,
            price,
            authority,
        }
    }
}