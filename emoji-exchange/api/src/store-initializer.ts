import * as anchor from "@project-serum/anchor";
import { 
    DEFAULT_STORE_EMOJI_STARTING_BALANCE, 
    DEFAULT_STORE_EMOJI_STARTING_PRICE, 
    EMOJIS_LIST 
} from "../../app/src/utils/const";
import { AnchorConfigs } from "./main";



 export async function createStoreEmoji(
    config: AnchorConfigs, 
    emojiDisplay: string, 
    emojiSeed: string,
    display: string,
): Promise<void> {

    console.log(`Emoji: ${emojiDisplay}`);
    console.log(`Pubkey: ${await config.seedUtil.getStoreEmojiPda(emojiSeed)}`);
    try {
        await config.program.methods.createStoreEmoji(
            emojiSeed, 
            display,
            DEFAULT_STORE_EMOJI_STARTING_BALANCE, 
            new anchor.BN(DEFAULT_STORE_EMOJI_STARTING_PRICE)
        )
            .accounts({
                storeEmoji: await config.seedUtil.getStoreEmojiPda(emojiSeed),
                authority: config.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([config.masterWallet])
            .rpc();
    } catch (e) {
        console.log(e);
        console.log(`Store Emoji account exists for: ${emojiSeed}`);
        console.log(`Pubkey: ${await config.seedUtil.getStoreEmojiPda(emojiSeed)}`);
    };
}


export async function initializeStore(config: AnchorConfigs) {

    console.log("Initializing store...");
    for (var emoji of EMOJIS_LIST) {
        await createStoreEmoji(config, emoji.display, emoji.seed, emoji.display);
    }
    console.log("Store initialized.");
}