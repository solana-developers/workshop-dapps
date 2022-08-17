import * as anchor from '@project-serum/anchor';
import * as constants from '../app/src/utils/const';
import * as util from '../app/src/utils/util';


function createKeypairFromFile(path: string): anchor.web3.Keypair {
    return anchor.web3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
    )
};


describe("Solana Twitter Anchor Tests", async () => {

    const testHandle: string = "realwillferrel";
    const testDisplayName: string = "Will Ferrel";

    const connection = new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT);
    const masterWallet = new anchor.Wallet(createKeypairFromFile(__dirname + '/../app/wallet/master.json'));

    let provider: anchor.AnchorProvider;
    let program: anchor.Program;
    let testWallet: anchor.Wallet;
    let testSolanaTwitterPda: anchor.web3.PublicKey;
    let testSolanaTwitterPdaBump: number;

    it("Prepare a new user wallet for testing", async () => {
        testWallet = await primeNewWallet("Test Wallet");
        [provider, program] = util.getAnchorConfigs(testWallet);
        [testSolanaTwitterPda, testSolanaTwitterPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                testWallet.publicKey.toBuffer(),
                Buffer.from("_profile"),
            ],
            program.programId,
        );
    });
    
    it("Create new Solana Twitter account", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createProfileTransaction(
                testWallet, testHandle, testDisplayName
            ))[0],
            [testWallet.payer]
        );
    });

    it("Update Solana Twitter account's handle", async () => {
        let existingDisplayName: string;
        try {
            existingDisplayName = (await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)).displayName;
        } catch (_) {
            throw("Solana Twitter account was not created successfully in previous test.");
        };
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.modifyProfileTransaction(
                testWallet, "dwightkschrute", existingDisplayName
            ))[0],
            [testWallet.payer]
        );
        await printTwitterAccountInfo(testSolanaTwitterPda);
    });
    it("Update Solana Twitter account's display name", async () => {
        let existingHandle: string;
        try {
            existingHandle = (await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)).handle;
        } catch (_) {
            throw("Solana Twitter account was not created successfully in previous test.");
        };
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.modifyProfileTransaction(
                testWallet, existingHandle, "Dwight Schrute"
            ))[0],
            [testWallet.payer]
        );
        await printTwitterAccountInfo(testSolanaTwitterPda);
    });

    it("Write new tweet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createTweetTransaction(
                testWallet, "Hello everybody",
            ))[0],
            [testWallet.payer]
        );
        const tweetCount = (await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)).tweetCount;
        const tweetPdaAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                testWallet.publicKey.toBuffer(),
                Buffer.from("_tweet_"),
                Buffer.from((tweetCount).toString()),
            ],
            program.programId,
        ))[0];
        await printTweet(tweetPdaAddress);
    });
    it("Write another tweet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createTweetTransaction(
                testWallet, "Shout out to all my followers!",
            ))[0],
            [testWallet.payer]
        );
        const tweetCount = (await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)).tweetCount;
        const tweetPdaAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                testWallet.publicKey.toBuffer(),
                Buffer.from("_tweet_"),
                Buffer.from((tweetCount).toString()),
            ],
            program.programId,
        ))[0];
        await printTweet(tweetPdaAddress);
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

    async function printTwitterAccountInfo(address: anchor.web3.PublicKey) {
        const accountInfo = await program.account.solanaTwitterAccountInfo.fetch(address);
        console.log(`Solana Twitter Account: ${address}`);
        console.log(`   Handle: ${accountInfo.handle}`);
        console.log(`   Display Name: ${accountInfo.displayName}`);
        console.log(`   Belongs to: ${accountInfo.authority}`);
    };

    async function printTweet(address: anchor.web3.PublicKey) {
        const tweetAccountInfo = await program.account.solanaTweet.fetch(address);
        const twitterAccountInfo = await program.account.solanaTwitterAccountInfo.fetch(tweetAccountInfo.twitterAccountPubkey);
        console.log(`Solana tweet: ${address}`);
        console.log(`   Solana Twitter Account: ${tweetAccountInfo.twitterAccountPubkey}`);
        console.log(`   Handle: ${twitterAccountInfo.handle}`);
        console.log(`   Display Name: ${twitterAccountInfo.displayName}`);
        console.log(`   Belongs to: ${twitterAccountInfo.authority}`);
        console.log(`   Body: ${tweetAccountInfo.body}`);
    };
});