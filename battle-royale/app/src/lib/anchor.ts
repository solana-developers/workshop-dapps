import * as anchor from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import idl from '../../../program/target/idl/battle_royale.json';
import { NETWORK, PREFLIGHT_COMMITMENT } from '../utils/const';
import { WeaponType } from './weapon';

export const anchorProgram = (wallet: AnchorWallet) => new anchor.Program(
    idl as anchor.Idl, 
    idl.metadata.address, 
    new anchor.AnchorProvider(
        new anchor.web3.Connection(NETWORK, PREFLIGHT_COMMITMENT), 
        wallet, 
        { "preflightCommitment": PREFLIGHT_COMMITMENT }
    )
)

export const sendTransaction = async (wallet: AnchorWallet, ixList: TransactionInstruction[]) => {
    const provider = anchorProgram(wallet).provider;
    let tx = new Transaction();
    ixList.forEach(ix => tx.add(ix));
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    tx.feePayer = wallet.publicKey;
    console.log(wallet.publicKey.toBase58())
    // await provider.sendAndConfirm((await wallet.signTransaction(tx)));
    await provider.sendAndConfirm(tx);
}

export function convertWeaponTypeToAnchorPayload(variant: WeaponType) {
    if (variant === WeaponType.Dagger) return { dagger: {} };
    if (variant === WeaponType.Hammer) return { hammer: {} };
    if (variant === WeaponType.Pistol) return { pistol: {} };
    if (variant === WeaponType.Sword) return { sword: {} };
}

export function convertWeaponTypeToString(variant: WeaponType) {
    if (variant === WeaponType.Dagger) return 'Dagger';
    if (variant === WeaponType.Hammer) return 'Hammer';
    if (variant === WeaponType.Pistol) return 'Pistol';
    if (variant === WeaponType.Sword) return 'Sword';
}