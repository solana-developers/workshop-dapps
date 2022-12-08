import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { anchorProgram } from './anchor';

const TABLE_NAME = 'equipped_magic';

export async function getEquippedMagic(wallet: AnchorWallet, id: number) {
    const program = anchorProgram(wallet);
    const [equippedMagicPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return await program.account.equippedMagic.fetch(equippedMagicPublicKey);
}

export async function getAllEquippedMagics(wallet: AnchorWallet) {
    return (await anchorProgram(wallet).account.equippedMagic.all()).map(o => { 
        return { publicKey: o.publicKey, ...o.account }
    });;
}

export async function createEquippedMagicInstruction(
    wallet: AnchorWallet,
    id: number,
    heroId: PublicKey,
    magicId: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [equippedMagicPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.createEquippedMagic(
        id, heroId, magicId,
    )
        .accounts({
            equippedMagic: equippedMagicPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}

export async function updateEquippedMagicInstruction(
    wallet: AnchorWallet,
    id: number,
    heroId: PublicKey,
    magicId: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [equippedMagicPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.updateEquippedMagic(
        id, heroId, magicId,
    )
        .accounts({
            equippedMagic: equippedMagicPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}

export async function deleteEquippedMagicInstruction(
    wallet: AnchorWallet,
    id: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [equippedMagicPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.deleteEquippedMagic(
        id
    )
        .accounts({
            equippedMagic: equippedMagicPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}