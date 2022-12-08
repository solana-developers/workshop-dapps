import * as anchor from '@project-serum/anchor';
import { 
    Keypair, 
    sendAndConfirmTransaction, 
    Transaction 
} from '@solana/web3.js';
import fs from 'fs';
import { 
    describe, 
    it 
} from 'mocha';
import os from 'os';
import { 
    anchorProgram, 
    createMagicInstruction, 
    createHeroInstruction, 
    createWeaponInstruction, 
    createEquippedMagicInstruction
} from '../app/src/lib';
import { 
    mockMagics, 
    mockHeroes, 
    mockWeapons, 
    mockEquippedMagics
} from './mocks';

function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(path, "utf-8")))
    )
}

describe("Import Tests", async () => {

    const payer = createKeypairFromFile(os.homedir() + '/.config/solana/id.json');
    const wallet = new anchor.Wallet(payer)
    const program = anchorProgram(wallet);

    it("Import mock weapons", async () => {
        const tx = new Transaction();
        for (const weapon of mockWeapons) {
            const ix = await createWeaponInstruction(
                wallet, weapon.id, weapon.icon, weapon.weaponName, weapon.weaponType, weapon.damage
            );
            tx.add(ix);
        }
        await sendAndConfirmTransaction(
            program.provider.connection,
            tx,
            [wallet.payer],
        );
    });

    it("Import mock magics", async () => {
        const tx = new Transaction();
        for (const magic of mockMagics) {
            const ix = await createMagicInstruction(
                wallet, magic.id, magic.icon, magic.magicName, magic.damageIncrease
            );
            tx.add(ix);
        }
        await sendAndConfirmTransaction(
            program.provider.connection,
            tx,
            [wallet.payer],
        );
    });

    it("Import mock heroes", async () => {
        const tx = new Transaction();
        for (const hero of mockHeroes) {
            const ix = await createHeroInstruction(
                wallet, hero.id, hero.icon, hero.name, hero.currentWeapon,
            );
            tx.add(ix);
        }
        await sendAndConfirmTransaction(
            program.provider.connection,
            tx,
            [wallet.payer],
        );
    });

    it("Import mock equipped magics", async () => {
        const tx = new Transaction();
        for (const equippedMagic of mockEquippedMagics) {
            const ix = await createEquippedMagicInstruction(
                wallet, equippedMagic.id, equippedMagic.heroId, equippedMagic.magicId,
            );
            tx.add(ix);
        }
        await sendAndConfirmTransaction(
            program.provider.connection,
            tx,
            [wallet.payer],
            { skipPreflight: true }
        );
    });
});