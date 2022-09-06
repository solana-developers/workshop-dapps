import { PublicKey } from "@solana/web3.js";


export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'

export interface ProfileObject {
    walletPubkey: PublicKey,
    profilePubkey: PublicKey,
    displayName: string,
    handle: string,
    tweetCount: number,
};

export interface TweetObject {
    walletPubkey: PublicKey,
    profilePubkey: PublicKey,
    tweetPubkey: PublicKey,
    displayName: string,
    handle: string,
    message: string,
    likeCount: number,
    retweetCount: number,
    tweetLiked: boolean,
    tweetRetweeted: boolean,
};

export interface RetweetObject {
    retweeterProfilePubkey: PublicKey,
    walletPubkey: PublicKey,
    profilePubkey: PublicKey,
    tweetPubkey: PublicKey,
    displayName: string,
    handle: string,
    message: string,
    likeCount: number,
    retweetCount: number,
    tweetLiked: boolean,
    tweetRetweeted: boolean,
};

export interface WriteTweetObject {
    publicKey: PublicKey,
    displayName: string,
    handle: string,
    tweetCount: number,
};