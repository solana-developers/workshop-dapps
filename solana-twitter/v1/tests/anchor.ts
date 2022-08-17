import * as anchor from '@project-serum/anchor';
import { SolanaTwitter } from '../target/types/solana_twitter';

describe("Solana Twitter Anchor Tests", async () => {

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.SolanaTwitter as anchor.Program<SolanaTwitter>;

    const testWallet = anchor.web3.Keypair.generate();
    let testSolanaTwitterPda: anchor.web3.PublicKey;
    let testSolanaTwitterPdaBump: number;

    it("Prepare a new user wallet for testing", async () => {
        // Airdrop to wallet
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(testWallet.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
        );
        console.log(`Test Wallet Pubkey: ${testWallet.publicKey}`);
        // Derive Solana Twitter account PDA
        [testSolanaTwitterPda, testSolanaTwitterPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                testWallet.publicKey.toBuffer(),
                Buffer.from("_profile"),
            ],
            program.programId,
        );
    });
    
    async function printTwitterAccountInfo(address: anchor.web3.PublicKey) {
        const accountInfo = await program.account.solanaTwitterAccountInfo.fetch(address);
        console.log(`Solana Twitter Account: ${address}`);
        console.log(`   Username: ${accountInfo.handle}`);
        console.log(`   Display Name: ${accountInfo.displayName}`);
        console.log(`   Belongs to: ${accountInfo.authority}`);
    };
    it("Create new Solana Twitter account", async () => {
        await program.methods.createUserAccount(
            "solana_master", "The Solana Master"
        )
        .accounts({
            twitterAccount: testSolanaTwitterPda,
            authority: testWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([testWallet])
        .rpc();
        await printTwitterAccountInfo(testSolanaTwitterPda);
    });

    async function updateTwitterAccount(handle: string, name: string) {
        await program.methods.modifyUserAccount(
            handle, name, testSolanaTwitterPdaBump
        )
        .accounts({
            twitterAccount: testSolanaTwitterPda,
            authority: testWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([testWallet])
        .rpc();
    };
    it("Update Solana Twitter account's handle", async () => {
        // Fetch existing display name
        const existingDisplayName = (await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)).displayName;
        await updateTwitterAccount("solana_beast", existingDisplayName);
        await printTwitterAccountInfo(testSolanaTwitterPda);
    });
    it("Update Solana Twitter account's display name", async () => {
        // Fetch existing handle
        const existingUsername = (await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)).handle;
        await updateTwitterAccount(existingUsername, "The Solana Beast");
        await printTwitterAccountInfo(testSolanaTwitterPda);
    });

    async function writeTweet(tweetPdaAddress: anchor.web3.PublicKey, body: string) {
        await program.methods.writeTweet(
            body, testSolanaTwitterPdaBump
        )
        .accounts({
            tweet: tweetPdaAddress,
            twitterAccount: testSolanaTwitterPda,
            authority: testWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([testWallet])
        .rpc();
    };
    async function printTweet(address: anchor.web3.PublicKey) {
        const tweetAccountInfo = await program.account.solanaTweet.fetch(address);
        const twitterAccountInfo = await program.account.solanaTwitterAccountInfo.fetch(tweetAccountInfo.twitterAccountPubkey);
        console.log(`Solana tweet: ${address}`);
        console.log(`   Solana Twitter Account: ${tweetAccountInfo.twitterAccountPubkey}`);
        console.log(`   Username: ${twitterAccountInfo.handle}`);
        console.log(`   Display Name: ${twitterAccountInfo.displayName}`);
        console.log(`   Belongs to: ${twitterAccountInfo.authority}`);
        console.log(`   Body: ${tweetAccountInfo.body}`);
    };
    it("Write new tweet", async () => {
        // Derive the tweet address
        const tweetCount = (await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)).tweetCount;
        console.log(`Tweet Count: ${tweetCount}`);
        const tweetPdaAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                testWallet.publicKey.toBuffer(),
                Buffer.from("_tweet_"),
                Buffer.from((tweetCount + 1).toString()),
            ],
            program.programId,
        ))[0];
        await writeTweet(tweetPdaAddress, "Hello everybody");
        await printTweet(tweetPdaAddress);
    });
    it("Write another tweet", async () => {
        // Derive the tweet address
        const tweetCount = (await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)).tweetCount;
        const tweetPdaAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                testWallet.publicKey.toBuffer(),
                Buffer.from("_tweet_"),
                Buffer.from((tweetCount + 1).toString()),
            ],
            program.programId,
        ))[0];
        await writeTweet(tweetPdaAddress, "Shout out to all my followers");
        await printTweet(tweetPdaAddress);
    });

    it("Testing getProgramAccounts", async () => {
        const programAccounts = await program.account.solanaTweet.all();
        for (var pa of programAccounts) {
            console.log(pa);
            const twitterAccount = await program.account.solanaTwitterAccountInfo.fetch(pa.account.twitterAccountPubkey);
            console.log(twitterAccount.handle);
            console.log(twitterAccount.displayName);
            console.log(pa.account.tweetNumber);
            console.log(pa.account.body);
        }
    });
});