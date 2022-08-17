import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import {
  IDS,
  Config,
  getSpotMarketByBaseSymbol,
} from "@blockworks-foundation/mango-client";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { EMOJIS_LIST } from '../app/src/utils/const';
import * as constants from '../app/src/utils/const';
import * as util from '../app/src/utils/util';
import { exit } from "process";


const STORE_WALLET = new anchor.Wallet(createKeypairFromFile(__dirname + '/../app/wallet/master.json'));

// Mango configs
const mangoCluster = "mainnet";
const mangoGroup = "mainnet.1";
const mangoConfig = new Config(IDS);
const mangoGroupConfig = mangoConfig.getGroup(mangoCluster, mangoGroup);
if (!mangoGroupConfig) {
    throw new Error("Unable to get mango group config");
}
const mangoClusterUrl = IDS.cluster_urls[mangoCluster];
const mangoConnection = new Connection(mangoClusterUrl, 'singleGossip');
let prevMangoPriceMap = new Map<string, number>();

// Utils
function createKeypairFromFile(path: string): anchor.web3.Keypair {
    return anchor.web3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
    )
};
function getMappedToken(emojiName: string): string {
    for (var emoji of EMOJIS_LIST) {
        if (emoji.seed === emojiName) return emoji.mappedToken;
    };
    throw("Emoji not found!");
}

// Modify prices
async function getMangoPriceForToken(token: string): Promise<number> {
    const marketConfig = getSpotMarketByBaseSymbol(mangoGroupConfig, token);
    const market = await Market.load(
      mangoConnection,
      marketConfig.publicKey,
      {},
      mangoGroupConfig.serumProgramId
  );
  const bids = await market.loadBids(mangoConnection);
  return bids.getL2(1)[0][0];
}
function priceChangeAlgorithm(
    prevEmojiPrice: number,
    prevMangoPrice: number,
    newMangoPrice: number,
): number {
    const mangoPriceChange = (newMangoPrice - prevMangoPrice) / prevMangoPrice;
    console.log(`Mango price change: ${mangoPriceChange}%`);
    const emojiPriceChange = mangoPriceChange * constants.PRICE_CHANGE_MULTIPLIER;
    return (1 + emojiPriceChange) * prevEmojiPrice;
}
async function modifyPrice(
    emojiSeed: string, 
    mappedToken: string, 
    emojiPrice: number
): Promise<number> {
    let prevMangoPrice = 0;
    let newPrice = emojiPrice;
    const newMangoPrice = await getMangoPriceForToken(mappedToken);
    prevMangoPrice = prevMangoPriceMap.get(emojiSeed);
    if (prevMangoPrice) newPrice = priceChangeAlgorithm(emojiPrice, prevMangoPrice, newMangoPrice);
    prevMangoPriceMap.set(emojiSeed, newMangoPrice);
    return newPrice;
}

// Initialize store
export async function initializeStore() {
    console.log("Initializing vault...");
    try {
        var [tx, provider] = await util.initializeVault(STORE_WALLET);
        await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
        var [tx, provider] = await util.fundVault(STORE_WALLET, constants.VAULT_INIT_FUND_AMOUNT);
        await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
    } catch (e) {
        console.log("Vault already initialized.");
    };
    console.log("Vault initialized successfully.");

    console.log("Initializing store...");
    for (var emoji of constants.EMOJIS_LIST) {
        var [tx, provider] = await util.createStoreEmojiTransaction(STORE_WALLET, emoji.seed, emoji.display);
        try {
            await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
        } catch (e) {
            console.log(e);
            console.log(`Store Emoji account exists for: ${emoji.seed}`);
            console.log(`Pubkey: ${tx.instructions[0].keys[0].pubkey.toString()}`);
        }
    }
    console.log("Store initialized.");
}

// Reset the game
export async function resetEmojiExchange() {
    console.log("Resetting Emoji Exchange...");
    var [tx, provider] = await util.reset(STORE_WALLET);
    await provider.connection.confirmTransaction(
        (await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]))
    );
    console.log("Reset complete.");
}

async function main() {
    if (process.argv[2] === "reset") {
        await resetEmojiExchange();
    };
    await initializeStore();
    const store = await util.loadStore(STORE_WALLET);
    while (true) {
        console.log("------------------");
        for (var emoji of store) {
            const prevEmojiPrice = emoji.price;
            const mappedToken = getMappedToken(emoji.emojiName);
            const newEmojiPrice = await modifyPrice(emoji.emojiName, mappedToken, prevEmojiPrice);
            const change = prevEmojiPrice ? Math.round((newEmojiPrice - prevEmojiPrice) / prevEmojiPrice * 100) : 0;
            const fromStart = Math.round((newEmojiPrice - constants.DEFAULT_STORE_EMOJI_STARTING_PRICE) / constants.DEFAULT_STORE_EMOJI_STARTING_PRICE * 100);
            var [tx, provider] = await util.updateStoreEmojiPriceTransaction(STORE_WALLET, emoji.emojiName, newEmojiPrice);
            await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
            console.log(
                `Emoji: ${emoji.emojiName} Price: ${newEmojiPrice / LAMPORTS_PER_SOL} Prev: ${prevEmojiPrice / LAMPORTS_PER_SOL} Change: ${change}% From Start: ${fromStart}%`
            );
        };
        await new Promise( resolve => setTimeout(resolve, 5000) );
    };
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);