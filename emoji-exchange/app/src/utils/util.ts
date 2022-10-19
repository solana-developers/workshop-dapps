import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as constants from './const';
import { 
    convertOrderTypeToAnchorPayload,
    GameObject,
    OrderType, 
    ProfitLeaderObject, 
    StoreEmojiObject, 
    UserEmojiObject,
    UserMetadataObject
} from '../models/types';
import { SeedUtil } from "./seed-util";


/**
 * Builds the Anchor configs from the IDL
 * @param wallet 
 * @returns Provider & Program objects
 */
export async function getAnchorConfigs(
    wallet: AnchorWallet
): Promise<[anchor.AnchorProvider, anchor.Program, SeedUtil]> {
    
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT), 
        wallet, 
        { "preflightCommitment": constants.PREFLIGHT_COMMITMENT }
    );
    const idl = require("../utils/idl.json");
    const program = new anchor.Program(idl, idl.metadata.address, provider);
    let seedUtil = new SeedUtil(program);
    await seedUtil.init();
    return [provider, program, seedUtil];
}


export async function getGame(
    wallet: AnchorWallet,
): Promise<GameObject> {
    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const response = await program.account.game.fetch(
        seedUtil.gamePda
    );
    return {
        isActive: response.isActive as boolean,
        prize: response.prize as number,
    };
}


/**
 * Fetches a store emoji account
 * @param wallet 
 * @param emojiSeed 
 * @returns StoreEmojiObject
 */
export async function getStoreEmoji(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<StoreEmojiObject> {
    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    try {
        const response = await program.account.storeEmoji.fetch(
            await seedUtil.getStoreEmojiPda(emojiSeed)
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


/**
 * Loads all store emoji accounts
 * @param wallet 
 * @returns List of StoreEmojiObject
 */
export async function loadStore(wallet: AnchorWallet): Promise<StoreEmojiObject[]> {
    
    let store: StoreEmojiObject[] = [];
    for (var emoji of constants.EMOJIS_LIST) {
        try {
            store.push(await getStoreEmoji(wallet, emoji.seed));
        } catch (_) {};
    };
    return store;
}


/**
 * Creates a user metadata account
 * @param wallet 
 * @param username 
 * @returns CreateUserMetadata Transaction
 */
export async function createUserMetadataTransaction(
    wallet: AnchorWallet,
    username: string,
): Promise<anchor.web3.Transaction> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const ix = await program.methods.createUserMetadata(
        username, 
        new anchor.BN(constants.DEFAULT_USER_STARTING_EBUCKS_BALANCE)
    )
        .accounts({
            userMetadata: await seedUtil.getUserMetadataPda(wallet.publicKey),
            authority: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    return new anchor.web3.Transaction().add(ix);
}


/**
 * Fetches a user's metadata account
 * @param wallet 
 * @returns UserMetadataObject
 */
export async function getUserMetadata(
    wallet: AnchorWallet,
): Promise<UserMetadataObject> {

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    try {
        const response = await program.account.userMetadata.fetch(
            await seedUtil.getUserMetadataPda(wallet.publicKey)
        );
        let eBucksBalance = response.ebucksBalance as anchor.BN;
        let eBucksBalanceNumber = eBucksBalance.toNumber();
        return {
            pubkey: provider.wallet.publicKey as anchor.web3.PublicKey,
            username: response.username as string,
            ebucksBalance: eBucksBalanceNumber,
            tradeCount: response.tradeCount as number,
            authority: response.authority as anchor.web3.PublicKey,
        };
    } catch (e) {
        throw Error(`User metadata not found for ${wallet.publicKey}`);
    }
}


/**
 * Loads all metadata accounts & their profits
 * @param wallet 
 * @returns List of ProfitLeaderObject
 */
 export async function getProfitLeaders(wallet: AnchorWallet): Promise<ProfitLeaderObject[]> {
    
    let profitLeaders: ProfitLeaderObject[] = [];
    const [_provider, program, _seedUtil] = await getAnchorConfigs(wallet);
    const allMetadataAccounts = await program.account.userMetadata.all();
    for (var metadataAccount of allMetadataAccounts) {
        console.log(`Metadata Address: ${metadataAccount.publicKey}`);
        let eBucksBalance = metadataAccount.account.ebucksBalance as anchor.BN;
        let eBucksBalanceNumber = eBucksBalance.toNumber();
        let eBucksProfitNumber = eBucksBalanceNumber - constants.DEFAULT_USER_STARTING_EBUCKS_BALANCE;
        profitLeaders.push({
            username: metadataAccount.account.username as string,
            ebucksBalance: eBucksBalanceNumber,
            ebucksProfit: eBucksProfitNumber,
            tradeCount: metadataAccount.account.tradeCount as number,
            authority: metadataAccount.account.authority as anchor.web3.PublicKey,
        })
    }
    return profitLeaders;
}


/**
 * Creates a user emoji account
 * @param wallet 
 * @param emojiSeed 
 * @returns CreateUserEmoji Instruction
 */
export async function createUserEmojiInstruction(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<anchor.web3.TransactionInstruction> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const ix = await program.methods.createUserEmoji(
        emojiSeed, 
    )
        .accounts({
            storeEmoji: await seedUtil.getStoreEmojiPda(emojiSeed),
            userEmoji: await seedUtil.getUserEmojiPda(emojiSeed, wallet.publicKey),
            game: seedUtil.gamePda,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    return ix;
}


/**
 * Fetches a user emoji account
 * @param wallet 
 * @param emojiSeed 
 * @returns UserEmojiObject
 */
export async function getUserEmoji(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<UserEmojiObject> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    try {
        const response = await program.account.userEmoji.fetch(
            await seedUtil.getUserEmojiPda(emojiSeed, wallet.publicKey)
        );
        return {
            emojiName: response.emojiName as string,
            display: response.display as string,
            balance: response.balance as number,
            costAverage: response.costAverage as number,
        };
    } catch (e) {
        throw Error(`User emoji account not found for ${emojiSeed}`);
    }
}

/**
 * Loads all user emoji accounts
 * @param wallet 
 * @returns List of UserEmojiObject
 */
export async function loadUserStore(wallet: AnchorWallet): Promise<UserEmojiObject[]> {
    
    let userStore: UserEmojiObject[] = [];
    for (var emoji of constants.EMOJIS_LIST) {
        try {
            const userEmojiAccount = await getUserEmoji(wallet, emoji.seed);
            userStore.push({
                emojiName: userEmojiAccount.emojiName as string,
                display: userEmojiAccount.display as string,
                balance: userEmojiAccount.balance as number,
                costAverage: userEmojiAccount.costAverage as number,
            });
        } catch (e) {
            console.log(`User emoji account doesn't exist for ${emoji.seed}. Skipping...`)
        }
    };
    return userStore;
}


// TODO: Needs work
/**
 * Pays out USDC from the game to a user
 * @param wallet 
 * @returns CashOutUser Transaction
 */
export async function claimPrize(
    wallet: AnchorWallet,
): Promise<anchor.web3.Transaction> {

    const userMetadata = await getUserMetadata(wallet);
    console.log(`AUTHORITY: ${userMetadata.authority}`);

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const ix = await program.methods.claimPrize()
        .accounts({
            mint: seedUtil.USDC_MINT_ADDRESS,
            vaultTokenAccount: await seedUtil.deriveUsdcTokenAccount(seedUtil.gamePda),
            game: seedUtil.gamePda,
            userTokenAccount: await seedUtil.deriveUsdcTokenAccount(wallet.publicKey),
            userMetadata: await seedUtil.getUserMetadataPda(wallet.publicKey),
            userAuthority: wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        })
        .instruction();
    return new anchor.web3.Transaction().add(ix);
}


/**
 * Place an order to buy or sell an emoji from the exchange
 * @param wallet 
 * @param emojiSeed 
 * @param orderType 
 * @param quantity 
 * @returns PlaceOrder Transaction
 */
export async function placeOrder(
    wallet: AnchorWallet,
    emojiSeed: string, 
    orderType: OrderType,
    quantity: number,
): Promise<anchor.web3.Transaction> {

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    let tx = new anchor.web3.Transaction();
    try {
        let userEmoji = await getUserEmoji(wallet, emojiSeed);
    } catch(_) {
        tx.add(await createUserEmojiInstruction(wallet, emojiSeed));
    }
    const placeOrderIx = await program.methods.placeOrder(
        emojiSeed, 
        convertOrderTypeToAnchorPayload(orderType), 
        quantity
    )
        .accounts({
            userMetadata: await seedUtil.getUserMetadataPda(wallet.publicKey),
            userEmoji: await seedUtil.getUserEmojiPda(emojiSeed, wallet.publicKey),
            storeEmoji: await seedUtil.getStoreEmojiPda(emojiSeed),
            authority: provider.wallet.publicKey,
        })
        .instruction();
    tx.add(placeOrderIx);
    return tx;
}
