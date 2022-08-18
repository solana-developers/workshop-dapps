import * as anchor from "@project-serum/anchor";


export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'

export interface ProfileObject {
    walletPubkey: anchor.web3.PublicKey,
    profilePubkey: anchor.web3.PublicKey,
    displayName: string,
    handle: string,
    tweetCount: number,
};

export interface TweetObject {
    walletPubkey: anchor.web3.PublicKey,
    profilePubkey: anchor.web3.PublicKey,
    tweetPubkey: anchor.web3.PublicKey,
    displayName: string,
    handle: string,
    message: string,
};

export interface WriteTweetObject {
    publicKey: anchor.web3.PublicKey,
    displayName: string,
    handle: string,
    tweetCount: number,
};