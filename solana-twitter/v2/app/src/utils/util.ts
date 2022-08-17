import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import * as constants from './const';
import { ProfileObject, TweetObject } from '../models/types';


function getAnchorConfigs(wallet: AnchorWallet): [anchor.AnchorProvider, anchor.Program] | [null, null] {
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

async function getPda(provider: anchor.AnchorProvider, program: anchor.Program, seeds: string[]) {
    let pdaSeeds = [provider.wallet.publicKey.toBuffer()];
    for (var s of seeds) pdaSeeds.push(Buffer.from(s));
    return await anchor.web3.PublicKey.findProgramAddress(
        pdaSeeds,
        program.programId,
    );
}

export async function createProfileTransaction(
    wallet: AnchorWallet,
    handle: string,
    displayName: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const profilePda = (await getPda(provider, program, [constants.PROFILE_SEED]))[0];
    const ix = await program.methods.createUserAccount(
            handle, displayName
        )
        .accounts({
            twitterAccount: profilePda,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
};

export async function modifyProfileTransaction(
    wallet: AnchorWallet,
    handle: string,
    displayName: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [profilePda, profilePdaBump] = await getPda(provider, program, [constants.PROFILE_SEED]);
    const ix = await program.methods.modifyUserAccount(
            handle, displayName, profilePdaBump
        )
        .accounts({
            twitterAccount: profilePda,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
};

export async function getProfile(wallet: AnchorWallet): Promise<ProfileObject> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const profilePda = (await getPda(provider, program, [constants.PROFILE_SEED]))[0];
    try {
        const returnedAccount = await program.account.solanaTwitterAccountInfo.fetch(profilePda);
        console.log(`Address: ${profilePda}`);
        console.log(`Handle: ${returnedAccount.handle}`);
        console.log(`Name: ${returnedAccount.displayName}`);
        return {
            publicKey: provider.wallet.publicKey as anchor.web3.PublicKey,
            displayName: returnedAccount.displayName as string,
            handle: returnedAccount.handle as string,
            tweetCount: returnedAccount.tweetCount as number,
        };
    } catch (e) {
        console.log(e);
        throw("Profile not found");
    }
};

export async function createTweetTransaction(
    wallet: AnchorWallet,
    message: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [profilePda, profilePdaBump] = await getPda(provider, program, [constants.PROFILE_SEED]);
    const tweetCount = (await program.account.solanaTwitterAccountInfo.fetch(profilePda)).tweetCount as number;
    const tweetPda = (await getPda(provider, program, [constants.TWEET_SEED, (tweetCount + 1).toString()]))[0];
    const ix = await program.methods.writeTweet(
            message, profilePdaBump
        )
        .accounts({
            tweet: tweetPda,
            twitterAccount: profilePda,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
};

export async function getAllTweets(wallet: AnchorWallet): Promise<TweetObject[]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    if (!program) throw("Program is null");
    let allTweets: TweetObject[] = [];
    const tweets = await program.account.solanaTweet.all();
    for (var tw of tweets) {
        const twitterAccount = await program.account.solanaTwitterAccountInfo.fetch(tw.account.twitterAccountPubkey as anchor.web3.PublicKey);
        allTweets.push({
            publicKey: provider.wallet.publicKey as anchor.web3.PublicKey,
            displayName: twitterAccount.displayName as string,
            handle: twitterAccount.handle as string,
            message: tw.account.body as string,
        });
    };
    return allTweets
};