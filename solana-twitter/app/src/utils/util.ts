import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import * as constants from './const';
import * as seedUtils from './seed-util';
import { ProfileObject, TweetObject } from '../models/types';


/**
 * Builds the Anchor configs from the IDL
 * @param wallet 
 * @returns Provider & Program objects
 */
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

/**
 * Creates a user profile
 * @param wallet 
 * @param handle 
 * @param displayName 
 * @returns CreateProfile Transaction
 */
export async function createProfileTransaction(
    wallet: AnchorWallet,
    handle: string,
    displayName: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {

    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [profilePda] = await seedUtils.deriveProfileSeeds(wallet.publicKey, program);
    const ix = await program.methods.createProfile(handle, displayName)
        .accounts({
            profile: profilePda,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
};


/**
 * Modifies an existing profile
 * @param wallet 
 * @param handle 
 * @param displayName 
 * @returns ModifyProfile Transaction
 */
export async function modifyProfileTransaction(
    wallet: AnchorWallet,
    handle: string,
    displayName: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {

    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [profilePda] = await seedUtils.deriveProfileSeeds(wallet.publicKey, program);
    const ix = await program.methods.modifyProfile(handle, displayName)
        .accounts({
            profile: profilePda,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
};


/**
 * Fetches a profile account using it's public key
 * @param wallet 
 * @returns The profile, represented by the ProfileObject object from 'models/types.ts'
 */
export async function getProfile(wallet: AnchorWallet): Promise<ProfileObject> {

    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [profilePda] = await seedUtils.deriveProfileSeeds(wallet.publicKey, program);
    try {
        const profile = await program.account.solanaTwitterProfile.fetch(profilePda);
        return {
            walletPubkey: profile.authority as anchor.web3.PublicKey,
            profilePubkey: profile.publicKey as anchor.web3.PublicKey,
            displayName: profile.displayName as string,
            handle: profile.handle as string,
            tweetCount: profile.tweetCount as number,
        };
    } catch (e) {
        console.log(e);
        throw("Profile not found");
    }
};


/**
 * Creates a new tweet for a user's profile
 * @param wallet 
 * @param message 
 * @returns CreateTweet Transaction
 */
export async function createTweetTransaction(
    wallet: AnchorWallet,
    message: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {

    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [profilePda, tweetPda] = await seedUtils.deriveTweetSeeds(wallet.publicKey, program);
    const ix = await program.methods.createTweet(message)
        .accounts({
            tweet: tweetPda,
            profile: profilePda,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
};


/**
 * Fetches a tweet account using it's public key
 * @param wallet 
 * @returns The tweet, represented by the TweetObject object from 'models/types.ts'
 */
export async function getTweet(wallet: AnchorWallet, tweetPubkey: anchor.web3.PublicKey): Promise<TweetObject> {
    
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    if (!program) throw("Program is null");
    const tweet = await program.account.solanaTweet.fetch(tweetPubkey);
    const profile = await program.account.solanaTwitterProfile.fetch(tweet.profilePubkey);
    return {
        walletPubkey: profile.authority as anchor.web3.PublicKey,
        profilePubkey: tweet.profilePubkey as anchor.web3.PublicKey,
        tweetPubkey: tweet.publicKey as anchor.web3.PublicKey,
        displayName: profile.displayName as string,
        handle: profile.handle as string,
        message: tweet.body as string,
    }
};

/**
 * Fetches all tweet accounts
 * @param wallet 
 * @returns A list of TweetObject objects from 'models/types.ts'
 */
export async function getAllTweets(wallet: AnchorWallet): Promise<TweetObject[]> {
    
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    if (!program) throw("Program is null");
    let allTweets: TweetObject[] = [];
    const allTweetsResponse = await program.account.solanaTweet.all();
    for (var tweet of allTweetsResponse) {
        const profile = await program.account.solanaTwitterProfile.fetch(tweet.account.profilePubkey);
        allTweets.push({
            walletPubkey: profile.authority as anchor.web3.PublicKey,
            profilePubkey: profile.publicKey as anchor.web3.PublicKey,
            tweetPubkey: tweet.publicKey as anchor.web3.PublicKey,
            displayName: profile.displayName as string,
            handle: profile.handle as string,
            message: tweet.account.body as string,
        });
    };
    return allTweets
};

/**
 * Creates a new like for a tweet
 * @param wallet 
 * @param tweetPubkey 
 * @returns CreateLike Transaction
 */
export async function createLikeTransaction(
    wallet: AnchorWallet,
    tweetPubkey: anchor.web3.PublicKey,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [
        profilePda, 
        likePda, 
        likeMintPda, 
        likeMintAuthorityPda, 
        authorWalletPubkey, 
        authorTokenAccountPubkey,
    ] = await seedUtils.deriveLikeSeeds(tweetPubkey, wallet.publicKey, program);
    const ix = await program.methods.createLike()
        .accounts({
            likeMint: likeMintPda,
            likeMintAuthority: likeMintAuthorityPda,
            authorTokenAccount: authorTokenAccountPubkey,
            like: likePda,
            tweet: tweetPubkey,
            submitterProfile: profilePda,
            authorWallet: authorWalletPubkey,
            authority: provider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
};

/**
 * Fetches all likes for a particular tweet
 * @param wallet 
 * @param tweetPubkey 
 * @returns A list of ProfileObject objects (profiles that have liked)
 * 
 * TODO: Make this faster??
 */
export async function getAllLikesForTweet(
    wallet: AnchorWallet,
    tweetPubkey: anchor.web3.PublicKey,
): Promise<ProfileObject[]> {
    
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    if (!program) throw("Program is null");
    let allLikes: ProfileObject[] = [];
    const allLikesResponse = await program.account.solanaLike.all();
    for (var like of allLikesResponse) {
        if (like.account.tweetPubkey === tweetPubkey) {
            const profile = await program.account.solanaTwitterProfile.fetch(like.account.profilePubkey as anchor.web3.PublicKey);
            allLikes.push({
                walletPubkey: like.account.walletPubkey as anchor.web3.PublicKey,
                profilePubkey: like.account.profilePubkey as anchor.web3.PublicKey,
                displayName: profile.account.displayName as string,
                handle: profile.account.handle as string,
                tweetCount: profile.account.tweetCount as number,
            });
        };
    };
    return allLikes
};

/**
 * Creates a new retweet for a tweet
 * @param wallet 
 * @param tweetPubkey 
 * @returns CreateRetweet Transaction
 */
export async function createRetweetTransaction(
    wallet: AnchorWallet,
    tweetPubkey: anchor.web3.PublicKey,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [
        profilePda, 
        retweetPda, 
        retweetMintPda, 
        retweetMintAuthorityPda, 
        authorWalletPubkey, 
        authorTokenAccountPubkey,
    ] = await seedUtils.deriveRetweetSeeds(tweetPubkey, wallet.publicKey, program);
    const ix = await program.methods.createRetweet()
        .accounts({
            retweetMint: retweetMintPda,
            retweetMintAuthority: retweetMintAuthorityPda,
            authorTokenAccount: authorTokenAccountPubkey,
            retweet: retweetPda,
            tweet: tweetPubkey,
            submitterProfile: profilePda,
            authorWallet: authorWalletPubkey,
            authority: provider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
};

/**
 * Fetches all retweets for a particular tweet
 * @param wallet 
 * @param tweetPubkey 
 * @returns A list of ProfileObject objects (profiles that have retweeted)
 * 
 * TODO: Make this faster??
 */
export async function getAllRetweetsForTweet(
    wallet: AnchorWallet,
    tweetPubkey: anchor.web3.PublicKey,
): Promise<ProfileObject[]> {
    
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    if (!program) throw("Program is null");
    let allRetweets: ProfileObject[] = [];
    const allRetweetsResponse = await program.account.solanaRetweet.all();
    for (var retweet of allRetweetsResponse) {
        if (retweet.account.tweetPubkey === tweetPubkey) {
            const profile = await program.account.solanaTwitterProfile.fetch(retweet.account.profilePubkey as anchor.web3.PublicKey);
            allRetweets.push({
                walletPubkey: retweet.account.walletPubkey as anchor.web3.PublicKey,
                profilePubkey: retweet.account.profilePubkey as anchor.web3.PublicKey,
                displayName: profile.account.displayName as string,
                handle: profile.account.handle as string,
                tweetCount: profile.account.tweetCount as number,
            });
        };
    };
    return allRetweets
};


export async function createMints(
    masterWallet: AnchorWallet,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    
    const [provider, program] = getAnchorConfigs(masterWallet);
    if (!provider) throw("Provider is null");
    const [likeMintPda, likeMintAuthorityPda] = await seedUtils.deriveLikeMintSeeds(program);
    const likeMintIx = await program.methods.createLikeMint()
        .accounts({
            likeMint: likeMintPda,
            likeMintAuthority: likeMintAuthorityPda,
            payer: provider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .instruction();
    
    const [retweetMintPda, retweetMintAuthorityPda] = await seedUtils.deriveRetweetMintSeeds(program);
    const retweetMintIx = await program.methods.createRetweetMint()
        .accounts({
            retweetMint: retweetMintPda,
            retweetMintAuthority: retweetMintAuthorityPda,
            payer: provider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .instruction();
    
    let tx = new anchor.web3.Transaction().add(likeMintIx).add(retweetMintIx);
    return [tx, provider];
};