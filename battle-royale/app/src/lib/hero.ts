import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { anchorProgram } from './anchor';

const TABLE_NAME = 'hero';

export async function getHeroAddress(wallet: AnchorWallet, publicKey: PublicKey) {
    const add = (await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), publicKey.toBuffer()],
        anchorProgram(wallet).programId,
    ))[0];
    console.log(`Hero Address: (Derived) : ${add}`);
    return add;
}

export async function getHero(wallet: AnchorWallet, id: PublicKey) {
    const program = anchorProgram(wallet);
    const [heroPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), id.toBuffer()],
        program.programId,
    );
    return await program.account.hero.fetch(heroPublicKey);
}

export async function getAllHeroes(wallet: AnchorWallet) {
    return (await anchorProgram(wallet).account.hero.all()).map(o => { 
        return { publicKey: o.publicKey, ...o.account }
    });;
}

export async function createHeroInstruction(
    wallet: AnchorWallet,
    id: PublicKey,
    icon: string,
    name: string,
    currentWeapon: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [heroPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), id.toBuffer()],
        program.programId,
    );
    return program.methods.createHero(
        id, icon, name, currentWeapon
    )
        .accounts({
            hero: heroPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}

export async function updateHeroInstruction(
    wallet: AnchorWallet,
    id: PublicKey,
    icon: string,
    name: string,
    kills: number,
    currentWeapon: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [heroPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), id.toBuffer()],
        program.programId,
    );
    return program.methods.updateHero(
        id, icon, name, kills, currentWeapon
    )
        .accounts({
            hero: heroPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}

export async function deleteHeroInstruction(
    wallet: AnchorWallet,
    id: PublicKey,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [heroPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), id.toBuffer()],
        program.programId,
    );
    return program.methods.deleteHero(
        id
    )
        .accounts({
            hero: heroPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}