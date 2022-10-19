import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { AnchorConfigs } from "./main";



const PRIZE_AMOUNT_USDC: number = 1;
const SOL_FUND_AMOUNT: number = 2;


interface InitializeGameArgs {
    reset: boolean,
    fundSol: boolean,
    fundUsdc: boolean,
}


async function reset(config: AnchorConfigs) {

    console.log("Resetting Emoji Exchange...");
    let tx = new anchor.web3.Transaction();
    // Close all user emojis
    for (var userEmoji of (await config.program.account.userEmoji.all())) {
        tx.add((await config.program.methods.closeUserEmoji()
            .accounts({
                userEmoji: userEmoji.publicKey,
                masterWallet: config.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close all user accounts
    for (var userMetadata of (await config.program.account.userMetadata.all())) {
        tx.add((await config.program.methods.closeUserMetadata()
            .accounts({
                userMetadata: userMetadata.publicKey,
                masterWallet: config.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close all store emojis
    for (var storeEmoji of (await config.program.account.storeEmoji.all())) {
        tx.add((await config.program.methods.closeStoreEmoji()
            .accounts({
                storeEmoji: storeEmoji.publicKey,
                masterWallet: config.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    // Close the game
    for (var game of (await config.program.account.game.all())) {
        tx.add((await config.program.methods.closeGame()
            .accounts({
                game: game.publicKey,
                masterWallet: config.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .instruction()));
    };
    await sendAndConfirmTransaction(
        config.provider.connection,
        tx,
        [config.masterWallet],
    )
    console.log("Reset complete.");
}


async function createGame(config: AnchorConfigs) {

    console.log("Initializing game...");
    try {
        await config.program.methods.createGame(
            new anchor.BN(PRIZE_AMOUNT_USDC / 0.000001)
        )
            .accounts({
                game: config.seedUtil.gamePda,
                authority: config.masterWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([config.masterWallet])
            .rpc();
    } catch (e) {
        console.log(e);
        console.log("Game already initialized.");
    };
    console.log("Game initialized successfully.");
    console.log("Initializing USDC vault...");
    try {
        const vaultTokenAccountAddress =
            await getOrCreateAssociatedTokenAccount(
                config.provider.connection,
                config.masterWallet,
                config.seedUtil.USDC_MINT_ADDRESS,
                config.seedUtil.gamePda,
                true,
            );
        console.log(`MASTER USDC: ${await config.seedUtil.deriveUsdcTokenAccount(config.masterWallet.publicKey)}`);
        console.log(`VAULT USDC: ${vaultTokenAccountAddress.address.toString()}`);
        console.log(`VAULT USDC: ${vaultTokenAccountAddress.amount}`);
    } catch (e) {
        console.log(e);
        console.log("USDC vault already initialized.");
    };
    console.log("USDC vault initialized successfully.");
}


async function fundSol(config: AnchorConfigs) {

    console.log("Funding game's vault with SOL...");
    await config.program.methods.fundVaultSol(
        new anchor.BN(SOL_FUND_AMOUNT * LAMPORTS_PER_SOL)
    )
        .accounts({
            game: config.seedUtil.gamePda,
            authority: config.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([config.masterWallet])
        .rpc();
    console.log("Success.");
}


async function fundUsdc(config: AnchorConfigs) {

    console.log("Funding game's vault with USDC...");
    await config.program.methods.fundVaultUsdc()
        .accounts({
            mint: config.seedUtil.USDC_MINT_ADDRESS,
            vaultTokenAccount: await config.seedUtil.deriveUsdcTokenAccount(config.seedUtil.gamePda),
            game: config.seedUtil.gamePda,
            masterTokenAccount: await config.seedUtil.deriveUsdcTokenAccount(config.masterWallet.publicKey),
            authority: config.masterWallet.publicKey,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([config.masterWallet])
        .rpc();
    console.log("Success.");
}


export async function initializeGame(
    args: InitializeGameArgs, 
    config: AnchorConfigs, 
) {

    if (args.reset) { await reset(config) };
    await createGame(config);
    if (args.fundSol) { await fundSol(config) };
    if (args.fundUsdc) { await fundUsdc(config) };
}
