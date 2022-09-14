import {
    Connection,
    Keypair,
    PublicKey,
} from '@solana/web3.js';
export * from './instructions';
export * from './state';


export function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
    )
};