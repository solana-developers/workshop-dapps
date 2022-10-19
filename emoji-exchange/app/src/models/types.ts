import * as anchor from "@project-serum/anchor";


export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'

export enum OrderType { 
    BUY, 
    SELL 
};

export interface GameObject {
    isActive: boolean,
    prize: number,
}

export interface StoreEmojiObject {
    emojiName: string,
    display: string,
    balance: number,
    price: number,
}

export interface UserMetadataObject {
    pubkey: anchor.web3.PublicKey,
    username: string,
    ebucksBalance: number,
    tradeCount: number,
    authority: anchor.web3.PublicKey,
}

export interface ProfitLeaderObject {
    username: string,
    ebucksBalance: number,
    ebucksProfit: number,
    tradeCount: number,
    authority: anchor.web3.PublicKey,
}

export interface UserEmojiObject {
    emojiName: string,
    display: string,
    balance: number,
    costAverage: number,
}

export function convertOrderTypeToAnchorPayload(variant: OrderType) {
    if (variant === OrderType.BUY) {
        return { buy: {} };
    } else {
        return { sell: {} };
    }
}