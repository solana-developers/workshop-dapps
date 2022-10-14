import * as anchor from "@project-serum/anchor";



export const PROFILE_SEED_PREFIX = "profile";
export const TWEET_SEED_PREFIX = "tweet"
export const LIKE_SEED_PREFIX = "like"
export const LIKE_MINT_SEED_PREFIX = "like_mint"
export const LIKE_MINT_AUTHORITY_SEED_PREFIX = "like_mint_authority"
export const RETWEET_SEED_PREFIX = "retweet"
export const RETWEET_MINT_SEED_PREFIX = "retweet_mint"
export const RETWEET_MINT_AUTHORITY_SEED_PREFIX = "retweet_mint_authority"

export const NETWORK = process.env.RPC_ENDPOINT;
// export const NETWORK = "https://api.devnet.solana.com";
// export const NETWORK = "http://localhost:8899";
export const PREFLIGHT_COMMITMENT = "confirmed";

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);