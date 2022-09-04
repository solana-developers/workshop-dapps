use anchor_lang::prelude::*;

use instructions::*;

pub mod instructions;
pub mod state;


declare_id!("DiDMyvMApLNZ21nct8YisKCb6HnZ7TED9rMrdusKDZMT");


#[program]
pub mod nft_minting {
    use super::*;

    pub fn mint_tweet_canvas_nft(
        ctx: Context<MintTweetCanvasNft>,
        metadata_title: String,
        metadata_symbol: String,
        metadata_uri: String,
    ) -> Result<()> {

        instructions::mint_tweet_canvas_nft::mint_tweet_canvas_nft(
            ctx, metadata_title, metadata_symbol, metadata_uri
        )
    }
}