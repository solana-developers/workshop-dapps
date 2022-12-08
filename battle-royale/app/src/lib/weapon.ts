import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { anchorProgram, convertWeaponTypeToAnchorPayload } from './anchor';

const TABLE_NAME = 'weapon';

export enum WeaponType {
    Dagger,
    Hammer,
    Pistol,
    Sword,
}

export async function getWeapon(wallet: AnchorWallet, id: number) {
    const program = anchorProgram(wallet);
    const [weaponPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return await program.account.weapon.fetch(weaponPublicKey);
}

export async function getAllWeapons(wallet: AnchorWallet) {
    return (await anchorProgram(wallet).account.weapon.all()).map(o => { 
        return { publicKey: o.publicKey, ...o.account }
    });
}

export async function createWeaponInstruction(
    wallet: AnchorWallet,
    id: number,
    icon: string,
    weaponName: string,
    weaponType: WeaponType,
    damage: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [weaponPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.createWeapon(
        id, icon, weaponName, convertWeaponTypeToAnchorPayload(weaponType), damage
    )
        .accounts({
            weapon: weaponPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}

export async function updateWeaponInstruction(
    wallet: AnchorWallet,
    id: number,
    icon: string,
    weaponName: string,
    weaponType: WeaponType,
    damage: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [weaponPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.updateWeapon(
        id, icon, weaponName, weaponType, damage
    )
        .accounts({
            weapon: weaponPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}

export async function deleteWeaponInstruction(
    wallet: AnchorWallet,
    id: number,
): Promise<TransactionInstruction> {
    const program = anchorProgram(wallet);
    const [weaponPublicKey, _] = await PublicKey.findProgramAddress(
        [Buffer.from(TABLE_NAME), Buffer.from(Uint8Array.of(id))],
        program.programId,
    );
    return program.methods.deleteWeapon(
        id
    )
        .accounts({
            weapon: weaponPublicKey,
            payer: wallet.publicKey,
        })
        .instruction();
}