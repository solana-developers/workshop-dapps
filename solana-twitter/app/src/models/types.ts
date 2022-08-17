import * as anchor from "@project-serum/anchor";


export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'

export interface ProfileObject {
    publicKey: anchor.web3.PublicKey,
    displayName: string,
    handle: string,
    tweetCount: number,
};

export interface TweetObject {
    publicKey: anchor.web3.PublicKey,
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