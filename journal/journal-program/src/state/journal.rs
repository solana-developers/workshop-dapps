use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;


// The journal account's data
//
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct JournalMetadata {
    pub nickname: String,
    pub authority: Pubkey,
    pub entries: u32,
    pub bump: u8,
}

impl JournalMetadata {

    pub const ACCOUNT_SPACE: usize = 8 + 40 + 32 + 4 + 1;
    pub const SEED_PREFIX: &'static str = "journal";

    pub fn new(
        nickname: String,
        authority: Pubkey,
        bump: u8,
    ) -> Self {
        
        JournalMetadata {
            nickname,
            authority,
            entries: 0,
            bump,
        }
    }

    pub fn increment(&mut self) {
        self.entries += 1;
    }
}