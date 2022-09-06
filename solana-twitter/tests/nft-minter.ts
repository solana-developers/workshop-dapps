import * as anchor from '@project-serum/anchor';
import * as constants from '../app_v1/src/utils/const';


const testTokenTitle = "Solana Gold";
const testTokenSymbol = "GOLDSOL";
const testTokenUri = "https://raw.githubusercontent.com/solana-developers/program-examples/main/tokens/mint-2/anchor/tests/token_metadata.json";

const connection: anchor.web3.Connection = new anchor.web3.Connection(
    constants.NETWORK, 
    constants.PREFLIGHT_COMMITMENT
);

let provider: anchor.AnchorProvider;
let program: anchor.Program;

let testWallet: anchor.Wallet;

describe("Solana Twitter Minter Tests", async () => {

    it("Prepare a new user wallet for testing", async () => {
        testWallet = await primeNewWallet("Test Wallet");
        provider = new anchor.AnchorProvider(
            new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT), 
            testWallet, 
            { "preflightCommitment": constants.PREFLIGHT_COMMITMENT }
        );
        const idl = require("../target/idl/nft_minting.json");
        program = new anchor.Program(idl, idl.metadata.address, provider);
    });

    it("Simluate minting of the Tweet Canvas NFT to multiple wallets", async () => {
        let tx: anchor.web3.Transaction = new anchor.web3.Transaction();
        for (var x = 0; x < 5; x++) {
            const mint = anchor.web3.Keypair.generate();
            const owner = anchor.web3.Keypair.generate();
            const tokenAccountPubkey = await anchor.utils.token.associatedAddress({
                mint: mint.publicKey,
                owner: owner.publicKey,
            });
            const [metadataAccountPubkey, _] = await anchor.web3.PublicKey
                .findProgramAddress(
                    [
                        Buffer.from("metadata"),
                        constants.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                        mint.publicKey.toBuffer(),
                    ],
                    constants.TOKEN_METADATA_PROGRAM_ID
                );
            tx.add(
                await program.methods.mintTweetCanvasNft(
                    testTokenTitle, testTokenSymbol, testTokenUri
                )
                    .accounts({
                        metadataAccount: metadataAccountPubkey,
                        mintAccount: mint.publicKey,
                        mintAuthority: owner.publicKey,
                        recipient: owner.publicKey,
                        tokenAccount: tokenAccountPubkey,
                        payer: testWallet.publicKey,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
                        tokenMetadataProgram: constants.TOKEN_METADATA_PROGRAM_ID,
                    })
                    // .signers([mint, owner])
                    .signers([mint, testWallet.payer])
                    .instruction()
            );
            console.log(`Simulated owner #${x}: ${owner.publicKey}`);
        };
        await anchor.web3.sendAndConfirmTransaction(
            connection, 
            tx, 
            [testWallet.payer]
        );
    });

    async function primeNewWallet(walletName: string) {
        const keypair = anchor.web3.Keypair.generate();
        await connection.confirmTransaction(
          await connection.requestAirdrop(keypair.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL)
        );
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`${walletName}: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        console.log(`Pubkey: ${keypair.publicKey}`);
        return new anchor.Wallet(keypair);
    }
});