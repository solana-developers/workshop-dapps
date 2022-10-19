import * as anchor from "@project-serum/anchor";
import * as constants from '../src/utils/const';
import * as dotenv from 'dotenv';
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { SeedUtil } from "utils/seed-util";


/**
 * Create the mints for Likes and Retweets
 * @param masterWallet 
 * @returns 
 */
 export async function createMints(
    masterWallet: AnchorWallet,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(process.env.RPC_ENDPOINT, constants.PREFLIGHT_COMMITMENT), 
        masterWallet, 
        { "preflightCommitment": constants.PREFLIGHT_COMMITMENT }
    );
    const idl = require("../src/utils/idl.json");
    const program = new anchor.Program(idl, idl.metadata.address, provider);
    let seedUtil = new SeedUtil(program);
    await seedUtil.init(masterWallet.publicKey);
    if (!provider) throw("Provider is null");
    const likeMintIx = await program.methods.createLikeMint()
        .accounts({
            likeMetadata: seedUtil.likeMetadataPda,
            likeMint: seedUtil.likeMintPda,
            likeMintAuthority: seedUtil.likeMintAuthorityPda,
            payer: provider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            tokenMetadataProgram: constants.TOKEN_METADATA_PROGRAM_ID,
        })
        .instruction();
    const retweetMintIx = await program.methods.createRetweetMint()
        .accounts({
            retweetMetadata: seedUtil.retweetMetadataPda,
            retweetMint: seedUtil.retweetMintPda,
            retweetMintAuthority: seedUtil.retweetMintAuthorityPda,
            payer: provider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            tokenMetadataProgram: constants.TOKEN_METADATA_PROGRAM_ID,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(likeMintIx).add(retweetMintIx);
    return [tx, provider];
};


async function main() {

    dotenv.config();

    const MASTER_WALLET: anchor.Wallet = new anchor.Wallet(
        anchor.web3.Keypair.fromSecretKey(
            Buffer.from(JSON.parse(
                require('fs').readFileSync(
                    __dirname + '/../wallet/master.json', 
                    "utf-8"
    )))));
    const connection: anchor.web3.Connection = new anchor.web3.Connection(
        process.env.RPC_ENDPOINT, 
        constants.PREFLIGHT_COMMITMENT
    );

    console.log("Creating a new mint for likes and retweets...");
    try {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await createMints(MASTER_WALLET))[0],
            [MASTER_WALLET.payer]
        );
        console.log("Success.");
    } catch(e) {
        console.log(e);
        console.log("Mints exist.");
    }
}


main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);