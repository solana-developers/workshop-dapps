import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import * as constants from './const';
import { 
    convertOrderTypeToAnchorPayload,
    OrderType, 
    ProfitLeaderObject,
    StoreEmojiObject, 
    UserEmojiObject,
    UserMetadataObject
} from '../models/types';
import { SeedUtil } from "./seed-util";


/**
 * Builds the Anchor configs from the IDL
 * @param wallet 
 * @returns Provider & Program objects
 */
export async function getAnchorConfigs(
    wallet: AnchorWallet
): Promise<[anchor.AnchorProvider, anchor.Program, SeedUtil]> {
    
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT), 
        wallet, 
        { "preflightCommitment": constants.PREFLIGHT_COMMITMENT }
    );
    const idl = require("../utils/idl.json");
    const program = new anchor.Program(idl, idl.metadata.address, provider);
    let seedUtil = new SeedUtil(program);
    await seedUtil.init();
    return [provider, program, seedUtil];
}


/**
 * Fetches a user's metadata account
 * @param wallet 
 * @returns UserMetadataObject
 */
export async function getUserMetadata(
    wallet: AnchorWallet,
): Promise<UserMetadataObject> {

    const [provider, program, seedUtil] = await getAnchorConfigs(wallet);
    try {
        const response = await program.account.userMetadata.fetch(
            await seedUtil.getUserMetadataPda(wallet.publicKey)
        );
        let eBucksBalance = response.ebucksBalance as anchor.BN;
        let eBucksBalanceNumber = eBucksBalance.toNumber();
        return {
            pubkey: provider.wallet.publicKey as anchor.web3.PublicKey,
            username: response.username as string,
            ebucksBalance: eBucksBalanceNumber,
            tradeCount: response.tradeCount as number,
            cashedOut: response.cashedOut as boolean,
        };
    } catch (e) {
        throw Error(`User metadata not found for ${wallet.publicKey}`);
    }
}


/**
 * Loads all metadata accounts & their profits
 * @param wallet 
 * @returns List of ProfitLeaderObject
 */
 export async function getProfitLeaders(wallet: AnchorWallet): Promise<ProfitLeaderObject[]> {
    
    let profitLeaders: ProfitLeaderObject[] = [];
    const [_provider, program, _seedUtil] = await getAnchorConfigs(wallet);
    const allMetadataAccounts = await program.account.userMetadata.all();
    for (var metadataAccount of allMetadataAccounts) {
        console.log(`Metadata Address: ${metadataAccount.publicKey}`);
        let eBucksBalance = metadataAccount.account.ebucksBalance as anchor.BN;
        let eBucksBalanceNumber = eBucksBalance.toNumber();
        let eBucksProfitNumber = eBucksBalanceNumber - constants.DEFAULT_USER_STARTING_EBUCKS_BALANCE;
        // let tradeCount = metadataAccount.account.tradeCount;
        // let tradeCountNumber = tradeCount.toNumber();
        profitLeaders.push({
            pubkey: metadataAccount.publicKey.toString() as string,
            username: metadataAccount.account.username as string,
            ebucksBalance: eBucksBalanceNumber,
            ebucksProfit: eBucksProfitNumber,
            tradeCount: metadataAccount.account.tradeCount as number,
        })
    }
    return profitLeaders;
}
