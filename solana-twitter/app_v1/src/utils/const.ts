import * as anchor from "@project-serum/anchor";



export const PROFILE_SEED_PREFIX = "profile";
export const TWEET_SEED_PREFIX = "tweet"
export const LIKE_SEED_PREFIX = "like"
export const RETWEET_SEED_PREFIX = "retweet"

export const NETWORK = "https://fragrant-quiet-firefly.solana-devnet.quiknode.pro/92162b0b2ff0d4d6f47f59605736273368541dd9/";
// export const NETWORK = "https://api.devnet.solana.com";
// export const NETWORK = "http://localhost:8899";
export const PREFLIGHT_COMMITMENT = "confirmed";

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);