import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ProfileObject, TweetObject } from '../models/types';
import * as constants from './const';
import { 
    allLikesErr,
    allRetweetsErr,
    allTweetsErr,
    profileNotFoundErr,
    tweetNotFoundErr,
    walletNullErr,
} from "./error";
import { SeedUtil } from './seed-util';


/**
 * Builds the Anchor configs from the IDL
 * @param wallet 
 * @returns Provider & Program objects
 */
export async function getAnchorConfigs(
    wallet: AnchorWallet
): Promise<[anchor.AnchorProvider, anchor.Program, SeedUtil]> {

    if (!wallet) { walletNullErr() };
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT), 
        wallet, 
        { "preflightCommitment": constants.PREFLIGHT_COMMITMENT }
    );
    const idl = require("./idl.json");
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
): Promise<anchor.web3.Transaction> {

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
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
    return new anchor.web3.Transaction().add(ix);
};


/**
 * Fetches a profile account using it's public key
 * @param wallet 
 * @returns The profile, represented by the ProfileObject object from 'models/types.ts'
 */
export async function getProfile(
    wallet: AnchorWallet
): Promise<ProfileObject> {

    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const profilePubkey = seedUtil.profilePda;
    let profile: anchor.IdlTypes<anchor.Idl>["SolanaTwitterProfile"];
    try {
        profile = await program
            .account.solanaTwitterProfile.fetch(profilePubkey);
    } catch(_) {
        profileNotFoundErr(profilePubkey); 
    };
    return {
        walletPubkey: profile.authority,
        profilePubkey: profile.publicKey,
        displayName: profile.displayName,
        handle: profile.handle,
        tweetCount: profile.tweetCount,
    };
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
): Promise<anchor.web3.Transaction> {

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const ix = await program.methods.createTweet(message)
        .accounts({
            tweet: await seedUtil.getNextTweetPda(),
            profile: seedUtil.profilePda,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    return new anchor.web3.Transaction().add(ix);
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
    
    const [_provider, program, _seedUtil] = await getAnchorConfigs(wallet);
    let tweet: anchor.IdlTypes<anchor.Idl>["SolanaTweet"];
    try {
        tweet = await program
            .account.solanaTweet.fetch(tweetPubkey);
    } catch (_) {
        tweetNotFoundErr(tweetPubkey);
    };
    const profilePubkey: anchor.web3.PublicKey = tweet.tweetprofilePubkey;
    let profile: anchor.IdlTypes<anchor.Idl>["SolanaTwitterProfile"];
    try {
        profile = await program
            .account.solanaTwitterProfile.fetch(profilePubkey);
    } catch (_) {
        profileNotFoundErr(profilePubkey);
    };
    const tweetLiked = (await getLike(wallet, tweetPubkey)) ? true : false;
    const tweetRetweeted = (await getRetweet(wallet, tweetPubkey)) ? true : false;
    return {
        walletPubkey: profile.authority,
        profilePubkey: profilePubkey,
        tweetPubkey: tweet.publicKey,
        displayName: profile.displayName,
        handle: profile.handle,
        message: tweet.body,
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount,
        tweetLiked: tweetLiked,
        tweetRetweeted: tweetRetweeted,
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
    
    const [_provider, program, _seedUtil] = await getAnchorConfigs(wallet);
    let allTweets: TweetObject[] = [];
    let allTweetsResponse: anchor.IdlTypes<anchor.Idl>["SolanaTweet"][];
    try {
        allTweetsResponse = await program
            .account.solanaTweet.all();
    } catch (_) {
        allTweetsErr();
    };
    for (var tweet of allTweetsResponse) {
        const tweetPubkey: anchor.web3.PublicKey = tweet.publicKey;
        const profilePubkey: anchor.web3.PublicKey = tweet.account.profilePubkey;
        let profile: anchor.IdlTypes<anchor.Idl>["SolanaTwitterProfile"];
        try {
            profile = await program
                .account.solanaTwitterProfile.fetch(profilePubkey);
        } catch(_) {
            profileNotFoundErr(profilePubkey);
        };
        let tweetLiked: boolean;
        try {
            let like = await getLike(wallet, tweetPubkey);
            tweetLiked = true;
        } catch(_) {};
        let tweetRetweeted: boolean;
        try {
            let retweet = await getRetweet(wallet, tweetPubkey);
            tweetRetweeted = true;
        } catch(_) {};
        allTweets.push({
            walletPubkey: profile.authority,
            profilePubkey: profilePubkey,
            tweetPubkey: tweetPubkey,
            displayName: profile.displayName,
            handle: profile.handle,
            message: tweet.account.body,
            likeCount: tweet.account.likeCount,
            retweetCount: tweet.account.retweetCount,
            tweetLiked: tweetLiked,
            tweetRetweeted: tweetRetweeted,
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
): Promise<anchor.web3.Transaction> {
    
    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
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
    return new anchor.web3.Transaction().add(ix);
};

/**
 * Fetches a wallet's like for a tweet, if it exists
 * @param wallet 
 * @param tweetPubkey 
 * @returns ProfileObject for a profile's like
 */
export async function getLike(
    wallet: AnchorWallet, 
    tweetPubkey: anchor.web3.PublicKey
): Promise<ProfileObject> {
    
    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const likePubkey: anchor.web3.PublicKey = await seedUtil.getLikePda(tweetPubkey);
    let like: anchor.IdlTypes<anchor.Idl>["SolanaLike"];
    try {
        like = await program
            .account.solanaLike.fetch(likePubkey);
    } catch (_) {
        tweetNotFoundErr(tweetPubkey);
    };
    const profilePubkey: anchor.web3.PublicKey = like.profilePubkey;
    let profile: anchor.IdlTypes<anchor.Idl>["SolanaTwitterProfile"]
    try {
        profile = await program
            .account.solanaTwitterProfile.fetch(profilePubkey);
    } catch (_) {
        profileNotFoundErr(profilePubkey);
    };
    return {
        walletPubkey: profile.authority,
        profilePubkey: profilePubkey,
        displayName: profile.displayName,
        handle: profile.handle,
        tweetCount: profile.tweetCount,
    }
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
    
    const [_provider, program, _seedUtil] = await getAnchorConfigs(wallet);
    let allLikes: ProfileObject[] = [];
    let allLikesResponse: anchor.IdlTypes<anchor.Idl>["SolanaLike"][];
    try {
        allLikesResponse = await program
            .account.solanaLike.all();
    } catch (_) {
        allLikesErr(tweetPubkey);
    };
    for (var like of allLikesResponse) {
        if (like.account.tweetPubkey === tweetPubkey) {
            const profilePubkey: anchor.web3.PublicKey = like.account.profilePubkey;
            let profile: anchor.IdlTypes<anchor.Idl>["SolanaTwitterProfile"];
            try {
                profile = await program
                    .account.solanaTwitterProfile.fetch(profilePubkey);
            } catch (_) {
                profileNotFoundErr(profilePubkey);
            };
            allLikes.push({
                walletPubkey: like.account.walletPubkey,
                profilePubkey: like.account.profilePubkey,
                displayName: profile.account.displayName,
                handle: profile.account.handle,
                tweetCount: profile.account.tweetCount,
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
): Promise<anchor.web3.Transaction> {
    
    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
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
    return new anchor.web3.Transaction().add(ix)
};

/**
 * Fetches a wallet's retweet for a tweet, if it exists
 * @param wallet 
 * @param tweetPubkey 
 * @returns ProfileObject for a profile's retweet
 */
 export async function getRetweet(
    wallet: AnchorWallet, 
    tweetPubkey: anchor.web3.PublicKey
): Promise<ProfileObject> {
    
    const [_provider, program, seedUtil] = await getAnchorConfigs(wallet);
    const retweetPubkey: anchor.web3.PublicKey = await seedUtil.getRetweetPda(tweetPubkey);
    let retweet: anchor.IdlTypes<anchor.Idl>["SolanaRetweet"];
    try {
        retweet = await program
            .account.solanaRetweet.fetch(retweetPubkey);
    } catch (_) {
        tweetNotFoundErr(tweetPubkey);
    };
    const profilePubkey: anchor.web3.PublicKey = retweet.profilePubkey;
    let profile: anchor.IdlTypes<anchor.Idl>["SolanaTwitterProfile"];
    try {
        profile = await program
            .account.solanaTwitterProfile.fetch(profilePubkey);
    } catch (_) {
        profileNotFoundErr(profilePubkey);
    };
    return {
        walletPubkey: profile.authority,
        profilePubkey: profilePubkey,
        displayName: profile.displayName,
        handle: profile.handle,
        tweetCount: profile.tweetCount,
    }
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
    
    const [_provider, program, _seedUtil] = await getAnchorConfigs(wallet);
    let allRetweets: ProfileObject[] = [];
    let allRetweetsResponse: anchor.IdlTypes<anchor.Idl>["SolanaRetweet"][];
    try {
        allRetweetsResponse = await program
            .account.solanaRetweet.all();
    } catch (_) {
        allRetweetsErr(tweetPubkey);
    };
    for (var retweet of allRetweetsResponse) {
        if (retweet.account.tweetPubkey === tweetPubkey) {
            const profilePubkey: anchor.web3.PublicKey = retweet.account.profilePubkey;
            let profile: anchor.IdlTypes<anchor.Idl>["SolanaTwitterProfile"];
            try {
                profile = await program
                    .account.solanaTwitterProfile.fetch(profilePubkey);
            } catch (_) {
                profileNotFoundErr(profilePubkey);
            };
            allRetweets.push({
                walletPubkey: retweet.account.walletPubkey,
                profilePubkey: retweet.account.profilePubkey,
                displayName: profile.account.displayName,
                handle: profile.account.handle,
                tweetCount: profile.account.tweetCount,
            });
        };
    };
    return allRetweets
};
