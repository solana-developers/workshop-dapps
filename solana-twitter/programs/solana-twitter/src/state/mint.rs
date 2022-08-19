use anchor_lang::prelude::*;
use mpl_token_metadata::state::Data;


pub struct LikeMintMetadata {}

impl LikeMintMetadata {
    pub const TITLE: &'static str = "Solana Twitter Like";
    pub const SYMBOL: &'static str = "STWLK";
    pub const URI: &'static str = "https://www.dictionary.com/e/wp-content/uploads/2018/05/20200727_emoji_twoHearts_1000x700.png";
}

#[account]
pub struct LikeMintAuthorityPda {
    pub bump: u8,
}

impl LikeMintAuthorityPda {
    pub const ACCOUNT_SPACE: usize = 8 + 8;
    pub const MINT_SEED_PREFIX: &'static str = "like_mint";
    pub const SEED_PREFIX: &'static str = "like_mint_authority";

    pub fn new(bump: u8) -> Self {
        return LikeMintAuthorityPda { 
            bump
        }
    }
}

pub struct RetweetMintMetadata {}

impl RetweetMintMetadata {
    pub const TITLE: &'static str = "Solana Twitter Retweet";
    pub const SYMBOL: &'static str = "STWRT";
    pub const URI: &'static str = "https://cdn.cms-twdigitalassets.com/content/dam/help-twitter/en/twitter-tips/desktop-assets/ch-01/ch13retweeticon.png.twimg.1920.png";
}

#[account]
pub struct RetweetMintAuthorityPda {
    pub bump: u8,
}

impl RetweetMintAuthorityPda {
    pub const ACCOUNT_SPACE: usize = 8 + 8;
    pub const MINT_SEED_PREFIX: &'static str = "retweet_mint";
    pub const SEED_PREFIX: &'static str = "retweet_mint_authority";

    pub fn new(bump: u8) -> Self {
        return RetweetMintAuthorityPda { 
            bump
        }
    }
}