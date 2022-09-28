import * as anchor from "@project-serum/anchor";


export const NETWORK = "https://api.devnet.solana.com/";
// export const NETWORK = "http://localhost:8899";
export const PREFLIGHT_COMMITMENT = "confirmed";

export const VAULT_SEED_PREFIX = "vault";
export const STORE_EMOJI_SEED_PREFIX = "store_emoji";
export const USER_EMOJI_SEED_PREFIX = "user_emoji";
export const USER_METADATA_SEED_PREFIX = "user_metadata";

export const VAULT_INIT_FUND_AMOUNT: number = 1 * anchor.web3.LAMPORTS_PER_SOL;
export const DEFAULT_STORE_EMOJI_STARTING_BALANCE = 40;
export const DEFAULT_STORE_EMOJI_STARTING_PRICE = 10;
export const DEFAULT_USER_STARTING_EBUCKS_BALANCE = 200;
export const PRICE_CHANGE_MULTIPLIER: number = 500;

export const MIN_TRADE_COUNT_FOR_CASHOUT = 5;

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
