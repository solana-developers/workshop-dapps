import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import * as constants from './const';
import { 
    convertOrderTypeToAnchorPayload,
    OrderType, 
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


/**
 * Initializes the game's vault for payouts
 * @param masterWallet 
 * @returns InitializeVault Transaction
 */
export async function initializeVault(
    masterWallet: AnchorWallet
): Promise<anchor.web3.Transaction> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(masterWallet);
    const ix = await program.methods.createVault()
        .accounts({
            vault: seedUtil.vaultPda,
            authority: masterWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    return new anchor.web3.Transaction().add(ix);
}


/**
 * Funds the game's vault
 * @param masterWallet 
 * @param amount 
 * @returns FundVault Transaction
 */
export async function fundVault(
    masterWallet: AnchorWallet, 
    amount: number
): Promise<anchor.web3.Transaction> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(masterWallet);
    const ix = await program.methods.fundVault(new anchor.BN(amount))
        .accounts({
            vault: seedUtil.vaultPda,
            authority: masterWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    return new anchor.web3.Transaction().add(ix);
}


/**
 * Get the balance of the game's vault
 * @param masterWallet 
 * @returns Balance (number) of USDC in the vault
 */
export async function getVaultBalance(masterWallet: AnchorWallet): Promise<number> {

    const [provider, _program, seedUtil] = await getAnchorConfigs(masterWallet);
    const balance = await provider.connection.getBalance(seedUtil.vaultPda);
    return balance;
}


/**
 * Creates a store emoji account
 * @param masterWallet 
 * @param emojiSeed 
 * @param display 
 * @returns CreateStoreEmoji Transaction
 */
export async function createStoreEmojiTransaction(
    masterWallet: AnchorWallet,
    emojiSeed: string,
    display: string,
): Promise<anchor.web3.Transaction> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(masterWallet);
    const ix = await program.methods.createStoreEmoji(
        emojiSeed, 
        display,
        constants.DEFAULT_STORE_EMOJI_STARTING_BALANCE, 
        new anchor.BN(constants.DEFAULT_STORE_EMOJI_STARTING_PRICE)
    )
        .accounts({
            storeEmoji: await seedUtil.getStoreEmojiPda(emojiSeed),
            authority: masterWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    return new anchor.web3.Transaction().add(ix);
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
            const storeEmojiAccount = await getStoreEmoji(wallet, emoji.seed);
            store.push({
                emojiName: storeEmojiAccount.emojiName as string,
                display: storeEmojiAccount.display as string,
                balance: storeEmojiAccount.balance as number,
                price: storeEmojiAccount.price as number,
            });
        } catch (_) {};
    };
    return store;
}


/**
 * Updates the price of a store emoji account
 * @param masterWallet 
 * @param emojiSeed 
 * @param newPrice 
 * @returns UpdateStoreEmojiPrice Transaction
 */
export async function updateStoreEmojiPriceTransaction(
    masterWallet: AnchorWallet,
    emojiSeed: string,
    newPrice: number,
): Promise<anchor.web3.Transaction> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(masterWallet);
    const ix = await program.methods.updateStoreEmojiPrice(
        emojiSeed, 
        new anchor.BN(newPrice),
    )
        .accounts({
            storeEmoji: await seedUtil.getStoreEmojiPda(emojiSeed),
            authority: masterWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    return new anchor.web3.Transaction().add(ix);
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
            vault: seedUtil.vaultPda,
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
        return {
            pubkey: provider.wallet.publicKey as anchor.web3.PublicKey,
            username: response.username as string,
            ebucksBalance: response.ebucksBalance as number,
            tradeCount: response.tradeCount as number,
            cashedOut: response.cashedOut as boolean,
        };
    } catch (e) {
        throw Error(`User metadata not found for ${wallet.publicKey}`);
    }
}


/**
 * Creates a user emoji account
 * @param wallet 
 * @param emojiSeed 
 * @returns CreateUserEmoji Transaction
 */
export async function createUserEmojiTransaction(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<anchor.web3.Transaction> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const ix = await program.methods.createUserEmoji(
        emojiSeed, 
    )
        .accounts({
            storeEmoji: await seedUtil.getStoreEmojiPda(emojiSeed),
            userEmoji: await seedUtil.getUserEmojiPda(emojiSeed, wallet.publicKey),
            vault: seedUtil.vaultPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    return new anchor.web3.Transaction().add(ix);
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
 * Pays out USDC from the vault to a user
 * @param wallet 
 * @param recipientPubkey 
 * @returns CashOutUser Transaction
 */
export async function cashOutUser(
    wallet: AnchorWallet,
    recipientPubkey: anchor.web3.PublicKey
): Promise<anchor.web3.Transaction> {

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const walletBalance = await provider.connection.getBalance(wallet.publicKey);
    const txFee = 0; // Calculate the tx fee to send
    const cashOutAmount = walletBalance - txFee;
    const ix = await program.methods.cashOutUser(
        cashOutAmount, 
    )
        .accounts({
            userMetadata: await seedUtil.getUserMetadataPda(wallet.publicKey),
            recipient: recipientPubkey,
            userWallet: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
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
        await getUserEmoji(provider.wallet, emojiSeed);
    } catch (_) {
        // If the user emoji account doesn't exist yet, we add it as our first ix
        tx.add(await createUserEmojiTransaction(provider.wallet, emojiSeed));
    };
    const ix = await program.methods.placeOrder(
        emojiSeed, 
        convertOrderTypeToAnchorPayload(orderType), 
        quantity
    )
        .accounts({
            userMetadata: await seedUtil.getUserMetadataPda(wallet.publicKey),
            userEmoji: await seedUtil.getUserEmojiPda(emojiSeed, wallet.publicKey),
            storeEmoji: await seedUtil.getStoreEmojiPda(emojiSeed),
            vault: seedUtil.vaultPda,
            userWallet: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    tx.add(ix);
    return tx;
}


/**
 * Reset the simulation by closing all accounts
 * @param masterWallet 
 * @returns ResetSimulation Transaction
 */
export async function reset(
    masterWallet: AnchorWallet
): Promise<anchor.web3.Transaction> {

    const [_provider, program, _seedUtil] = await getAnchorConfigs(masterWallet);
    let tx = new anchor.web3.Transaction();
    // Close all user emojis
    for (var userEmoji of (await program.account.userEmoji.all())) {
        tx.add((await program.methods.closeUserEmoji()
            .accounts({
                userEmoji: userEmoji.publicKey,
                masterWallet: masterWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close all user accounts
    for (var userMetadata of (await program.account.userMetadata.all())) {
        tx.add((await program.methods.closeUserMetadata()
            .accounts({
                userMetadata: userMetadata.publicKey,
                masterWallet: masterWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close all store emojis
    for (var storeEmoji of (await program.account.storeEmoji.all())) {
        tx.add((await program.methods.closeStoreEmoji()
            .accounts({
                storeEmoji: storeEmoji.publicKey,
                masterWallet: masterWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close the vault
    for (var vault of (await program.account.vault.all())) {
        tx.add((await program.methods.closeVault()
            .accounts({
                vault: vault.publicKey,
                masterWallet: masterWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    return tx;
}