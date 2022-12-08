import { Keypair } from '@solana/web3.js';
import { WeaponType } from '../app/src/lib';

const testPubkey = Keypair.generate().publicKey;

export const mockHeroes = [
    {
        id: testPubkey,
        icon: '🦩',
        name: 'Johnny',
        currentWeapon: 3,
    }
]

export const mockEquippedMagics = [
    {
        id: 1,
        heroId: testPubkey,
        magicId: 1,
    },
    {
        id: 2,
        heroId: testPubkey,
        magicId: 2,
    },
    {
        id: 3,
        heroId: testPubkey,
        magicId: 3,
    }
]

export const mockMagics = [
    {
        id: 1,
        icon: '🪄',
        magicName: 'Spell',
        damageIncrease: 50,
    },
    {
        id: 2,
        icon: '🔮',
        magicName: 'Incantation',
        damageIncrease: 75,
    },
    {
        id: 3,
        icon: '💥',
        magicName: 'Curse',
        damageIncrease: 100,
    },
];

export const mockWeapons = [
    {
        id: 1,
        icon: '🔪',
        weaponName: 'Little Wonder',
        weaponType: WeaponType.Dagger,
        damage: 50,
    },
    {
        id: 2,
        icon: '🗡️',
        weaponName: 'Bobcat',
        weaponType: WeaponType.Sword,
        damage: 150,
    },
    {
        id: 3,
        icon: '🔨',
        weaponName: 'Bruiser',
        weaponType: WeaponType.Hammer,
        damage: 350,
    },
    {
        id: 4,
        icon: '🔫',
        weaponName: 'Willie',
        weaponType: WeaponType.Pistol,
        damage: 150,
    },
];