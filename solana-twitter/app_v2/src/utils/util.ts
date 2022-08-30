import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ProfileObject, TweetObject } from '../models/types';
import * as constants from './const';
import { SeedUtil } from './seed-util';


/**
 * Builds the Anchor configs from the IDL
 * @param wallet 
 * @returns Provider & Program objects
 */
export async function getAnchorConfigs(
    wallet: AnchorWallet
): Promise<[anchor.AnchorProvider, anchor.Program, SeedUtil] | [null, null, null]> {

    if (!wallet) {
        return [null, null, null];
    }
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT), 
        wallet, 
        { "preflightCommitment": constants.PREFLIGHT_COMMITMENT }
    );
    const idl = require("../utils/idl.json");
    const program = new anchor.Program(idl, idl.metadata.address, provider);
    let seedUtil = new SeedUtil(program);
    await seedUtil.init(wallet.publicKey);
    return [provider, program, seedUtil];
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

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const ix = await program.methods.createProfile(handle, displayName)
        .accounts({
            likeMint: seedUtil.likeMintPda,
            likeMintAuthority: seedUtil.likeMintAuthorityPda,
            likeTokenAccount: await seedUtil.getLikeTokenAccount(wallet.publicKey),
            retweetMint: seedUtil.retweetMintPda,
            retweetMintAuthority: seedUtil.retweetMintAuthorityPda,
            retweetTokenAccount: await seedUtil.getRetweetTokenAccount(wallet.publicKey),
            profile: seedUtil.profilePda,
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

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const ix = await program.methods.modifyProfile(handle, displayName)
        .accounts({
            profile: seedUtil.profilePda,
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
export async function getProfile(
    wallet: AnchorWallet
): Promise<ProfileObject> {

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    try {
        const profile = await program.account.solanaTwitterProfile.fetch(
            seedUtil.profilePda
        );
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

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const ix = await program.methods.createTweet(message)
        .accounts({
            tweet: await seedUtil.getTweetPda(),
            profile: seedUtil.profilePda,
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
export async function getTweet(
    wallet: AnchorWallet, 
    tweetPubkey: anchor.web3.PublicKey
): Promise<TweetObject> {
    
    const [provider, program, _seedUtil] = await getAnchorConfigs(wallet);
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
export async function getAllTweets(
    wallet: AnchorWallet
): Promise<TweetObject[]> {
    
    const [provider, program, _seedUtil] = await getAnchorConfigs(wallet);
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
    
    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [authorWalletPubkey, authorLikeTokenAccount] = await seedUtil
        .getWalletAndLikeTokenAccountFromTweet(tweetPubkey);
    const ix = await program.methods.createLike()
        .accounts({
            likeMint: seedUtil.likeMintPda,
            likeMintAuthority: seedUtil.likeMintAuthorityPda,
            authorTokenAccount: authorLikeTokenAccount,
            like: await seedUtil.getLikePda(tweetPubkey),
            tweet: tweetPubkey,
            submitterProfile: seedUtil.profilePda,
            authorWallet: authorWalletPubkey,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
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
 */
export async function getAllLikesForTweet(
    wallet: AnchorWallet,
    tweetPubkey: anchor.web3.PublicKey,
): Promise<ProfileObject[]> {
    
    const [provider, program, _seedUtil] = await getAnchorConfigs(wallet);
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
    
    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [authorWalletPubkey, authorRetweetTokenAccount] = await seedUtil
        .getWalletAndRetweetTokenAccountFromTweet(tweetPubkey);
    const ix = await program.methods.createRetweet()
        .accounts({
            retweetMint: seedUtil.retweetMintPda,
            retweetMintAuthority: seedUtil.retweetMintAuthorityPda,
            authorTokenAccount: authorRetweetTokenAccount,
            retweet: await seedUtil.getRetweetPda(tweetPubkey),
            tweet: tweetPubkey,
            submitterProfile: seedUtil.profilePda,
            authorWallet: authorWalletPubkey,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
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
 */
export async function getAllRetweetsForTweet(
    wallet: AnchorWallet,
    tweetPubkey: anchor.web3.PublicKey,
): Promise<ProfileObject[]> {
    
    const [provider, program, _seedUtil] = await getAnchorConfigs(wallet);
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

/**
 * Create the mints for Likes and Retweets
 * @param masterWallet 
 * @returns 
 */
export async function createMints(
    masterWallet: AnchorWallet,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    
    const [provider, program, seedUtil] = await getAnchorConfigs(masterWallet);
    if (!provider) throw("Provider is null");
    const likeMintIx = await program.methods.createLikeMint()
        .accounts({
            likeMetadata: seedUtil.likeMetadataPda,
            likeMint: seedUtil.likeMintPda,
            likeMintAuthority: seedUtil.likeMintAuthorityPda,
            payer: provider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            tokenMetadataProgram: constants.TOKEN_METADATA_PROGRAM_ID,
        })
        .instruction();
    const retweetMintIx = await program.methods.createRetweetMint()
        .accounts({
            retweetMetadata: seedUtil.retweetMetadataPda,
            retweetMint: seedUtil.retweetMintPda,
            retweetMintAuthority: seedUtil.retweetMintAuthorityPda,
            payer: provider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            tokenMetadataProgram: constants.TOKEN_METADATA_PROGRAM_ID,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(likeMintIx).add(retweetMintIx);
    return [tx, provider];
};
