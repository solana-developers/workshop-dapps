import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import * as constants from './const';
import { 
    convertOrderTypeToAnchorPayload,
    OrderType, 
    StoreEmojiObject, 
    UserEmojiObject,
    UserAccountObject
} from '../models/types';


export function getAnchorConfigs(wallet: AnchorWallet): [anchor.AnchorProvider, anchor.Program] | [null, null] {
    if (!wallet) {
        return [null, null];
    }
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT), 
        wallet, 
        { "preflightCommitment": constants.PREFLIGHT_COMMITMENT }
    );
    const idl = require("../utils/idl.json");
    const program = new anchor.Program(idl, idl.metadata.address, provider);
    return [provider, program];
}


export async function initializeVault(
    storeWallet: AnchorWallet
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    const vaultPda = (await anchor.web3.PublicKey.findProgramAddress(
      [ Buffer.from(constants.VAULT_SEED) ],
      program.programId
    ))[0];
    const ix = await program.methods.createVault()
        .accounts({
            vault: vaultPda,
            storeWallet: storeWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function fundVault(
    storeWallet: AnchorWallet, 
    amount: number
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    const [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [ Buffer.from(constants.VAULT_SEED) ],
      program.programId
    );
    const ix = await program.methods.fundVault(
        vaultPdaBump, new anchor.BN(amount)
    )
        .accounts({
            vault: vaultPda,
            storeWallet: storeWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function getVaultBalance(storeWallet: AnchorWallet): Promise<number> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    const vaultPda = (await anchor.web3.PublicKey.findProgramAddress(
      [ Buffer.from(constants.VAULT_SEED) ],
      program.programId
    ))[0];
    const balance = await provider.connection.getBalance(vaultPda);
    return balance;
}


export async function createStoreEmojiTransaction(
    storeWallet: AnchorWallet,
    emojiSeed: string,
    display: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    if (!provider) throw("Provider is null");
    const storeEmojiPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_EMOJI_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    ))[0];
    const ix = await program.methods.createStoreEmoji(
        emojiSeed, 
        display,
        constants.DEFAULT_STORE_EMOJI_STARTING_BALANCE, 
        new anchor.BN(constants.DEFAULT_STORE_EMOJI_STARTING_PRICE)
    )
        .accounts({
            storeEmoji: storeEmojiPda,
            storeWallet: storeWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function getStoreEmoji(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<StoreEmojiObject> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const storeEmojiPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_EMOJI_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    ))[0];
    try {
        const response = await program.account.storeEmoji.fetch(storeEmojiPda);
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

export async function loadStore(wallet: AnchorWallet): Promise<StoreEmojiObject[]> {
    let store: StoreEmojiObject[] = [];
    for (var emoji of constants.EMOJIS_LIST) {
        const storeEmojiAccount = await getStoreEmoji(wallet, emoji.seed);
        console.log(`Successfully loaded store emoji account for ${emoji.seed}`);
        console.log(`emojiName: ${storeEmojiAccount.emojiName as string}`);
        console.log(`display: ${storeEmojiAccount.display as string}`);
        console.log(`balance: ${storeEmojiAccount.balance as number}`);
        console.log(`price: ${storeEmojiAccount.price as number}`);
        store.push({
            emojiName: storeEmojiAccount.emojiName as string,
            display: storeEmojiAccount.display as string,
            balance: storeEmojiAccount.balance as number,
            price: storeEmojiAccount.price as number,
        });
    };
    return store;
}

export async function updateStoreEmojiPriceTransaction(
    storeWallet: AnchorWallet,
    emojiSeed: string,
    newPrice: number,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    if (!provider) throw("Provider is null");
    const [storeEmojiPda, storeEmojiPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_EMOJI_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    );
    const ix = await program.methods.updateStoreEmojiPrice(
        storeEmojiPdaBump,
        emojiSeed, 
        new anchor.BN(newPrice),
    )
        .accounts({
            storeEmoji: storeEmojiPda,
            storeWallet: storeWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function createUserAccountTransaction(
    wallet: AnchorWallet,
    username: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [ Buffer.from(constants.VAULT_SEED) ],
        program.programId
    );
    const userAccountPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_ACCOUNT_SEED),
        ],
        program.programId
    ))[0];
    const ix = await program.methods.createUserAccount(
        username, 
        new anchor.BN(constants.DEFAULT_USER_ACCOUNT_STARTING_EBUCKS_BALANCE)
        // constants.DEFAULT_USER_ACCOUNT_STARTING_EBUCKS_BALANCE
        )
        .accounts({
            userAccount: userAccountPda,
            vault: vaultPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function getUserAccount(
    wallet: AnchorWallet,
): Promise<UserAccountObject> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const userAccountPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_ACCOUNT_SEED),
        ],
        program.programId
    ))[0];
    try {
        const response = await program.account.userAccount.fetch(userAccountPda);
        return {
            pubkey: provider.wallet.publicKey as anchor.web3.PublicKey,
            username: response.username as string,
            ebucksBalance: response.ebucksBalance as number,
            tradeCount: response.tradeCount as number,
            cashedOut: response.cashedOut as boolean,
        };
    } catch (e) {
        throw Error(`User account not found for ${wallet.publicKey}`);
    }
}

export async function createUserEmojiTransaction(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [ Buffer.from(constants.VAULT_SEED) ],
        program.programId
    );
    const [storeEmojiPda, storeEmojiPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_EMOJI_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    );
    const userEmojiPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_EMOJI_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    ))[0];
    const ix = await program.methods.createUserEmoji(
        storeEmojiPdaBump,
        emojiSeed, 
    )
        .accounts({
            storeEmoji: storeEmojiPda,
            userEmoji: userEmojiPda,
            vault: vaultPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function getUserEmoji(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<UserEmojiObject> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const userEmojiPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_EMOJI_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    ))[0];
    try {
        const response = await program.account.userEmoji.fetch(userEmojiPda);
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

export async function loadUserStore(wallet: AnchorWallet): Promise<UserEmojiObject[]> {
    let userStore: UserEmojiObject[] = [];
    for (var emoji of constants.EMOJIS_LIST) {
        try {
            const userEmojiAccount = await getUserEmoji(wallet, emoji.seed);
            console.log(`Successfully loaded user emoji account for ${emoji.seed}`);
            console.log(`emojiName: ${userEmojiAccount.emojiName as string}`);
            console.log(`display: ${userEmojiAccount.display as string}`);
            console.log(`balance: ${userEmojiAccount.balance as number}`);
            console.log(`costAverage: ${userEmojiAccount.costAverage as number}`);
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

export async function cashOutUser(
    wallet: AnchorWallet,
    recipientPubkey: anchor.web3.PublicKey
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const walletBalance = await provider.connection.getBalance(wallet.publicKey);
    const txFee = 0 // Calculate the tx fee to send
    const cashOutAmount = walletBalance - txFee;
    const [userAccountPda, userAccountPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_ACCOUNT_SEED),
        ],
        program.programId
    );
    const ix = await program.methods.cashOutUser(
        userAccountPdaBump,
        cashOutAmount, 
    )
        .accounts({
            userAccount: userAccountPda,
            recipient: recipientPubkey,
            userWallet: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function placeOrder(
    wallet: AnchorWallet,
    emojiSeed: string, 
    orderType: OrderType,
    quantity: number,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    let tx: anchor.web3.Transaction;
    try {
        await getUserEmoji(provider.wallet, emojiSeed);
        tx = new anchor.web3.Transaction();
    } catch (_) {
        tx = (await createUserEmojiTransaction(provider.wallet, emojiSeed))[0];
    };
    const [userAccountPda, userAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_ACCOUNT_SEED),
        ],
        program.programId
    );
    const [userEmojiPda, userEmojiPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_EMOJI_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    );
    const [storeEmojiPda, storeEmojiPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_EMOJI_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    );
    const [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [ Buffer.from(constants.VAULT_SEED) ],
        program.programId
    );
    const ix = await program.methods.placeOrder(
        userAccountBump,
        userEmojiPdaBump,
        storeEmojiPdaBump,
        vaultPdaBump,
        emojiSeed, 
        convertOrderTypeToAnchorPayload(orderType), 
        quantity
    )
        .accounts({
            userAccount: userAccountPda,
            userEmoji: userEmojiPda,
            storeEmoji: storeEmojiPda,
            vault: vaultPda,
            userWallet: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    tx.add(ix);
    return [tx, provider];
}

export async function reset(
    storeWallet: AnchorWallet
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    let tx = new anchor.web3.Transaction();
    // Close all user emojis
    for (var userEmoji of (await program.account.userEmoji.all())) {
        tx.add((await program.methods.closeUserEmoji()
            .accounts({
                userEmoji: userEmoji.publicKey,
                storeWallet: storeWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close all user accounts
    for (var userAccount of (await program.account.userAccount.all())) {
        tx.add((await program.methods.closeUserAccount()
            .accounts({
                userAccount: userAccount.publicKey,
                storeWallet: storeWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close all store emojis
    for (var storeEmoji of (await program.account.storeEmoji.all())) {
        tx.add((await program.methods.closeStoreEmoji()
            .accounts({
                storeEmoji: storeEmoji.publicKey,
                storeWallet: storeWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close the vault
    for (var vault of (await program.account.vault.all())) {
        tx.add((await program.methods.closeVault()
            .accounts({
                vault: vault.publicKey,
                storeWallet: storeWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    return [tx, provider];
}