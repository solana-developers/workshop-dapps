import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import {
    Cluster,
    Config,
    getSpotMarketByBaseSymbol,
    GroupConfig,
    IDS,
} from "@blockworks-foundation/mango-client";
import * as anchor from "@project-serum/anchor";
import { DEFAULT_STORE_EMOJI_STARTING_PRICE, EMOJIS_LIST } from "../../app/src/utils/const";
import { AnchorConfigs } from "./main";
import { StoreEmojiObject } from "../../app/src/models/types";



const PRICE_CHANGE_MULTIPLIER: number = 1000;

const mangoCluster: Cluster = "mainnet";
const mangoGroup: string = "mainnet.1";
const mangoConfig: Config = new Config(IDS);
const mangoGroupConfig: GroupConfig = mangoConfig.getGroup(mangoCluster, mangoGroup);
const mangoClusterUrl: string = IDS.cluster_urls[mangoCluster];
const mangoConnection: Connection = new Connection(mangoClusterUrl, 'singleGossip');

let prevMangoPriceMap: Map<string, number> = new Map<string, number>();


function getMappedToken(emojiName: string): string {

    for (var emoji of EMOJIS_LIST) {
        if (emoji.seed === emojiName) return emoji.mappedToken;
    };
    throw("Emoji not found!");
}


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
    const emojiPriceChange = mangoPriceChange * PRICE_CHANGE_MULTIPLIER;
    const newPrice = (1 + emojiPriceChange) * prevEmojiPrice;
    return newPrice < 1 ? 1 : newPrice;
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
    if (prevMangoPrice) {
        newPrice = priceChangeAlgorithm(emojiPrice, prevMangoPrice, newMangoPrice);
    };
    prevMangoPriceMap.set(emojiSeed, newMangoPrice);
    return newPrice;
}


async function updateStoreEmojiPrice(
    config: AnchorConfigs, 
    emojiSeed: string,
    newPrice: number,
): Promise<void> {

    await config.program.methods.updateStoreEmojiPrice(
        emojiSeed, 
        new anchor.BN(newPrice),
    )
        .accounts({
            storeEmoji: await config.seedUtil.getStoreEmojiPda(emojiSeed),
            authority: config.masterWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([config.masterWallet])
        .rpc();
}


async function getStoreEmoji(
    config: AnchorConfigs, 
    emojiSeed: string,
): Promise<StoreEmojiObject> {
    try {
        const response = await config.program.account.storeEmoji.fetch(
            await config.seedUtil.getStoreEmojiPda(emojiSeed)
        );
        return {
            emojiName: response.emojiName as string,
            display: response.display as string,
            balance: response.balance as number,
            price: response.price as number,
        };
    } catch (e) {
        console.log(e);
        throw Error(`Store emoji account not found for ${emojiSeed}`);
    }
}


async function loadStore(
    config: AnchorConfigs,
): Promise<StoreEmojiObject[]> {
    
    let store: StoreEmojiObject[] = [];
    for (var emoji of EMOJIS_LIST) {
        try {
            store.push(await getStoreEmoji(config, emoji.seed));
        } catch (_) {};
    };
    return store;
}


export async function runPriceModifier(config: AnchorConfigs) {

    const store = await loadStore(config);
    while (true) {
        console.log("------------------");
        console.log(`Store Length: ${store.length}`);
        for (var emoji of store) {
            const prevEmojiPrice = emoji.price;
            const mappedToken = getMappedToken(emoji.emojiName);
            const newEmojiPrice = await modifyPrice(emoji.emojiName, mappedToken, prevEmojiPrice);
            const change = prevEmojiPrice ? Math.round((newEmojiPrice - prevEmojiPrice) / prevEmojiPrice * 100) : 0;
            const fromStart = Math.round((newEmojiPrice - DEFAULT_STORE_EMOJI_STARTING_PRICE) / DEFAULT_STORE_EMOJI_STARTING_PRICE * 100);
            await updateStoreEmojiPrice(config, emoji.emojiName, newEmojiPrice);
            console.log(
                `Emoji: ${emoji.emojiName} Price: ${newEmojiPrice / LAMPORTS_PER_SOL} Prev: ${prevEmojiPrice / LAMPORTS_PER_SOL} Change: ${change}% From Start: ${fromStart}%`
            );
        };
        await new Promise( resolve => setTimeout(resolve, 10000) );
    };
}
