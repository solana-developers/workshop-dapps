import { PublicKey } from "@solana/web3.js"

export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'

export interface JournalMetadataInterface {
    nickname: string,
    authority: PublicKey,
    entries: number,
    bump: number,
}

export interface EntryMetadataInterface {
    entryNumber: number,
    message: string,
    journal: PublicKey,
    bump: number,
}