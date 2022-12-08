import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { anchorProgram } from './anchor';

const TABLE_NAME = 'magic';

export async function getMagic(wallet: AnchorWallet, id: number) {
    const program = anchorProgram(wallet);
    const [magicPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return await program.account.magic.fetch(magicPublicKey);
}

export async function getAllMagic(wallet: AnchorWallet) {
    return (await anchorProgram(wallet).account.magic.all()).map(o => { 
        return { publicKey: o.publicKey, ...o.account }
    });;
}

export async function createMagicInstruction(
    wallet: AnchorWallet,
    id: number,
    icon: string,
    magicName: string,
    damageIncrease: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [magicPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.createMagic(
        id, icon, magicName, damageIncrease
    )
        .accounts({
            magic: magicPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}

export async function updateMagicInstruction(
    wallet: AnchorWallet,
    id: number,
    icon: string,
    magicName: string,
    damageIncrease: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [magicPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.updateMagic(
        id, icon, magicName, damageIncrease
    )
        .accounts({
            magic: magicPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}

export async function deleteMagicInstruction(
    wallet: AnchorWallet,
    id: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [magicPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.deleteMagic(
        id
    )
        .accounts({
            magic: magicPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}