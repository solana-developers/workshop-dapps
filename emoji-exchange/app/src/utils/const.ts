

// export const NETWORK = "https://api.devnet.solana.com/";
// export const NETWORK = "http://localhost:8899";
export const NETWORK = process.env.RPC_ENDPOINT;
export const PREFLIGHT_COMMITMENT = "confirmed";

export const GAME_SEED_PREFIX = "game";
export const STORE_EMOJI_SEED_PREFIX = "store_emoji";
export const USER_EMOJI_SEED_PREFIX = "user_emoji";
export const USER_METADATA_SEED_PREFIX = "user_metadata";

export const DEFAULT_STORE_EMOJI_STARTING_BALANCE = 40;
export const DEFAULT_STORE_EMOJI_STARTING_PRICE = 10;
export const DEFAULT_USER_STARTING_EBUCKS_BALANCE = 200;

export const MIN_PROFIT_FOR_CASHOUT = 0;

export const EMOJIS_LIST = [
    { seed: "emoji_1", display: "😀", mappedToken: "SOL" },
    { seed: "emoji_2", display: "👻", mappedToken: "AVAX" },
    { seed: "emoji_3", display: "🤡", mappedToken: "ETH" },
    { seed: "emoji_4", display: "🤠", mappedToken: "SOL" },
    { seed: "emoji_5", display: "💸", mappedToken: "SRM" },
    { seed: "emoji_6", display: "💪", mappedToken: "RAY" },
    { seed: "emoji_7", display: "👀", mappedToken: "MSOL" },
    { seed: "emoji_8", display: "👑", mappedToken: "BNB" },
];
