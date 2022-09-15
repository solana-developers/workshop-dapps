import {
    Connection,
    Keypair,
    PublicKey,
} from '@solana/web3.js';


export function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
    )
};

export class Assignable {
    constructor(properties) {
        Object.keys(properties).map((key) => {
            return (this[key] = properties[key]);
        });
    };
};

export enum InstructionType {
    InitializeJournal,
    NewEntry,
};

