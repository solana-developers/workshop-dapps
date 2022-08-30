use anchor_lang::prelude::*;


pub struct LikeMintMetadata {}

impl LikeMintMetadata {
    pub const TITLE: &'static str = "Solana Twitter Like";
    pub const SYMBOL: &'static str = "STWLK";
    pub const URI: &'static str = "https://raw.githubusercontent.com/solana-developers/workshop-dapps/main/solana-twitter/app_v2/assets/like.json";
}

#[account]
pub struct LikeMintAuthorityPda {
    pub bump: u8,
    pub mint_bump: u8,
}

impl LikeMintAuthorityPda {
    pub const ACCOUNT_SPACE: usize = 8 + 8;
    pub const MINT_SEED_PREFIX: &'static str = "like_mint";
    pub const SEED_PREFIX: &'static str = "like_mint_authority";

    pub fn new(
        bump: u8,
        mint_bump: u8,
    ) -> Self {
        return LikeMintAuthorityPda { 
            bump,
            mint_bump,
        }
    }
}

pub struct RetweetMintMetadata {}

impl RetweetMintMetadata {
    pub const TITLE: &'static str = "Solana Twitter Retweet";
    pub const SYMBOL: &'static str = "STWRT";
    pub const URI: &'static str = "https://raw.githubusercontent.com/solana-developers/workshop-dapps/main/solana-twitter/app_v2/assets/retweet.json";
}

#[account]
pub struct RetweetMintAuthorityPda {
    pub bump: u8,
    pub mint_bump: u8,
}

impl RetweetMintAuthorityPda {
    pub const ACCOUNT_SPACE: usize = 8 + 8;
    pub const MINT_SEED_PREFIX: &'static str = "retweet_mint";
    pub const SEED_PREFIX: &'static str = "retweet_mint_authority";

    pub fn new(
        bump: u8,
        mint_bump: u8,
    ) -> Self {
        return RetweetMintAuthorityPda { 
            bump,
            mint_bump,
        }
    }
}