import * as anchor from '@project-serum/anchor';
import * as constants from '../app_v1/src/utils/const';
import { SeedUtil } from '../app_v1/src/utils/seed-util';
import * as util from '../app_v1/src/utils/util';


const connection: anchor.web3.Connection = new anchor.web3.Connection(
    constants.NETWORK, 
    constants.PREFLIGHT_COMMITMENT
);

let provider: anchor.AnchorProvider;
let program: anchor.Program;
let seedUtil: SeedUtil;

let testWallet1: anchor.Wallet;
let testWallet1ProfilePda: anchor.web3.PublicKey;
let testWallet1TweetPda: anchor.web3.PublicKey;
const testHandle1: string = "realwillferrel";
const testDisplayName1: string = "Will Ferrel";

let testWallet2: anchor.Wallet;
let testWallet2ProfilePda: anchor.web3.PublicKey;
const testHandle2: string = "darryl";
const testDisplayName2: string = "Darryl";


describe("Solana Twitter v1 Tests", async () => {

    it("Prepare a new user wallet for testing", async () => {
        testWallet1 = await primeNewWallet("Test Wallet");
        [provider, program, seedUtil] = await util.getAnchorConfigs(testWallet1);
        testWallet1ProfilePda = seedUtil.profilePda;
    });

    it("Create new profile", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            await util.createProfileTransaction(testWallet1, testHandle1, testDisplayName1),
            [testWallet1.payer]
        );
    });

    it("Update profile's handle", async () => {
        let existingDisplayName;
        try {
            existingDisplayName = (await program.account.solanaTwitterProfile.fetch(testWallet1ProfilePda)).displayName;
        } catch (_) {
            throw("Profile was not created successfully in previous test.");
        };
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            await util.modifyProfileTransaction(testWallet1, "dwightkschrute", existingDisplayName),
            [testWallet1.payer]
        );
        await printProfileInfo(testWallet1ProfilePda);
    });

    it("Update profile's display name", async () => {
        let existingHandle;
        try {
            existingHandle = (await program.account.solanaTwitterProfile.fetch(testWallet1ProfilePda)).handle;
        } catch (_) {
            throw("Profile was not created successfully in previous test.");
        };
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            await util.modifyProfileTransaction(testWallet1, existingHandle, "Dwight Schrute"),
            [testWallet1.payer]
        );
        await printProfileInfo(testWallet1ProfilePda);
    });

    async function writeTweet(message: string) {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            await util.createTweetTransaction(testWallet1, message),
            [testWallet1.payer]
        );
        testWallet1TweetPda = await seedUtil.getLatestTweetPda();
        await printTweet(testWallet1TweetPda);
    }
    it("Write a tweet (1/4)", async () => {
        await writeTweet("Hello everybody");
    });
    it("Write a tweet (2/4)", async () => {
        await writeTweet("Yoooo sup!");
    });
    it("Write a tweet (3/4)", async () => {
        await writeTweet("Peace everybody :)");
    });
    it("Write a tweet (4/4)", async () => {
        await writeTweet("Goodbye");
    });

    it("Prepare a second user wallet for testing", async () => {
        testWallet2 = await primeNewWallet("Test Wallet");
        [provider, program, seedUtil] = await util.getAnchorConfigs(testWallet2);
        testWallet2ProfilePda = seedUtil.profilePda;
    });

    it("Create a profile for the second wallet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            await util.createProfileTransaction(testWallet2, testHandle2, testDisplayName2),
            [testWallet2.payer]
        );
    });

    it("Like a tweet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            await util.createLikeTransaction(testWallet2, testWallet1TweetPda),
            [testWallet2.payer]
        );
    });

    it("Try to like the same tweet again", async () => {
        try {
            await anchor.web3.sendAndConfirmTransaction(
                connection,
                await util.createLikeTransaction(testWallet2, testWallet1TweetPda),
                [testWallet2.payer]
            );
            throw("Test failed. User was able to like a tweet again.")
        } catch (_) {};
    });

    it("Retweet a tweet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            await util.createRetweetTransaction(testWallet2, testWallet1TweetPda),
            [testWallet2.payer]
        );
    });

    it("Try to retweet the same tweet again", async () => {
        try {
            await anchor.web3.sendAndConfirmTransaction(
                connection,
                await util.createRetweetTransaction(testWallet2, testWallet1TweetPda),
                [testWallet2.payer]
            );
            throw("Test failed. User was able to retweet a tweet again.")
        } catch (_) {};
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

    async function printProfileInfo(address: anchor.web3.PublicKey) {
        const profileInfo = await program.account.solanaTwitterProfile.fetch(address);
        console.log(`Profile    : ${address}`);
        console.log(`   Handle      : ${profileInfo.handle}`);
        console.log(`   Display Name: ${profileInfo.displayName}`);
        console.log(`   Belongs to  : ${profileInfo.authority}`);
        console.log(`   Tweet Count : ${profileInfo.tweetCount}`);
    };

    async function printTweet(pubkey: anchor.web3.PublicKey) {
        const tweet = await program.account.solanaTweet.fetch(pubkey);
        const profileInfo = await program.account.solanaTwitterProfile.fetch(tweet.profilePubkey);
        console.log(`Tweet      : ${pubkey}`);
        console.log(`   Profile     : ${tweet.profilePubkey}`);
        console.log(`   Handle      : ${profileInfo.handle}`);
        console.log(`   Display Name: ${profileInfo.displayName}`);
        console.log(`   Belongs to  : ${profileInfo.authority}`);
        console.log(`   Tweet Count : ${profileInfo.tweetCount}`);
        console.log(`   Tweet Number: ${tweet.tweetNumber}`);
        console.log(`   Body        : ${tweet.body}`);
    };
});