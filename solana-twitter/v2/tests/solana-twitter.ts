import * as anchor from '@project-serum/anchor';
import * as constants from '../app/src/utils/const';
import * as util from '../app/src/utils/util';


const connection: anchor.web3.Connection = new anchor.web3.Connection(
    constants.NETWORK, 
    constants.PREFLIGHT_COMMITMENT
);

let provider: anchor.AnchorProvider;
let program: anchor.Program;

let testWallet1: anchor.Wallet;
let testWallet1ProfilePda: anchor.web3.PublicKey;
let testWallet1ProfilePdaBump: number;
let testWallet1TweetPda: anchor.web3.PublicKey;
let testWallet1TweetPdaBump: number;
const testHandle1: string = "realwillferrel";
const testDisplayName1: string = "Will Ferrel";

let testWallet2: anchor.Wallet;
let testWallet2ProfilePda: anchor.web3.PublicKey;
let testWallet2ProfilePdaBump: number;
const testHandle2: string = "darryl";
const testDisplayName2: string = "Darryl";


describe("Solana Twitter Anchor Tests", async () => {

    it("Prepare a new user wallet for testing", async () => {
        testWallet1 = await primeNewWallet("Test Wallet");
        [provider, program] = util.getAnchorConfigs(testWallet1);
        [testWallet1ProfilePda, testWallet1ProfilePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from(constants.PROFILE_SEED_PREFIX),
                testWallet1.publicKey.toBuffer(), 
            ],
            program.programId,
        );
    });
    it("Create new profile", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createProfileTransaction(
                testWallet1, testHandle1, testDisplayName1
            ))[0],
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
            (await util.modifyProfileTransaction(
                testWallet1, "dwightkschrute", existingDisplayName
            ))[0],
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
            (await util.modifyProfileTransaction(
                testWallet1, existingHandle, "Dwight Schrute"
            ))[0],
            [testWallet1.payer]
        );
        await printProfileInfo(testWallet1ProfilePda);
    });

    it("Write new tweet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createTweetTransaction(
                testWallet1, "Hello everybody",
            ))[0],
            [testWallet1.payer]
        );
        const tweetCount = (await program.account.solanaTwitterProfile.fetch(testWallet1ProfilePda)).tweetCount;
        [testWallet1TweetPda, testWallet1TweetPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from(constants.TWEET_SEED_PREFIX),
                testWallet1ProfilePda.toBuffer(), 
                Buffer.from(tweetCount.toString()),
            ],
            program.programId,
        );
        await printTweet(testWallet1TweetPda);
    });
    it("Write another tweet (1/3)", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createTweetTransaction(
                testWallet1, "Peace everybody :)",
            ))[0],
            [testWallet1.payer]
        );
        const tweetCount = (await program.account.solanaTwitterProfile.fetch(testWallet1ProfilePda)).tweetCount;
        [testWallet1TweetPda, testWallet1TweetPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from(constants.TWEET_SEED_PREFIX),
                testWallet1ProfilePda.toBuffer(), 
                Buffer.from(tweetCount.toString()),
            ],
            program.programId,
        );
        await printTweet(testWallet1TweetPda);
    });
    it("Write another tweet (2/3)", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createTweetTransaction(
                testWallet1, "Peace everybody :)",
            ))[0],
            [testWallet1.payer]
        );
        const tweetCount = (await program.account.solanaTwitterProfile.fetch(testWallet1ProfilePda)).tweetCount;
        [testWallet1TweetPda, testWallet1TweetPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from(constants.TWEET_SEED_PREFIX),
                testWallet1ProfilePda.toBuffer(), 
                Buffer.from(tweetCount.toString()),
            ],
            program.programId,
        );
        await printTweet(testWallet1TweetPda);
    });
    it("Write another tweet (3/3)", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createTweetTransaction(
                testWallet1, "Goodbye",
            ))[0],
            [testWallet1.payer]
        );
        const tweetCount = (await program.account.solanaTwitterProfile.fetch(testWallet1ProfilePda)).tweetCount;
        [testWallet1TweetPda, testWallet1TweetPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from(constants.TWEET_SEED_PREFIX),
                testWallet1ProfilePda.toBuffer(), 
                Buffer.from(tweetCount.toString()),
            ],
            program.programId,
        );
        await printTweet(testWallet1TweetPda);
    });

    it("Prepare a second user wallet for testing", async () => {
        testWallet2 = await primeNewWallet("Test Wallet");
        [provider, program] = util.getAnchorConfigs(testWallet2);
        [testWallet2ProfilePda, testWallet2ProfilePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from(constants.PROFILE_SEED_PREFIX),
                testWallet2.publicKey.toBuffer(),
            ],
            program.programId,
        );
    });
    it("Create a profile for the second wallet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createProfileTransaction(
                testWallet2, testHandle2, testDisplayName2
            ))[0],
            [testWallet2.payer]
        );
    });

    it("Like a tweet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.likeTweetTransaction(
                testWallet2, testWallet1TweetPda
            ))[0],
            [testWallet2.payer]
        );
    });
    it("Try to like the same tweet again", async () => {
        try {
            await anchor.web3.sendAndConfirmTransaction(
                connection,
                (await util.likeTweetTransaction(
                    testWallet2, testWallet1TweetPda
                ))[0],
                [testWallet2.payer]
            );
            throw("Test failed. User was able to like a tweet again.")
        } catch (_) {};
    });

    it("Retweet a tweet", async () => {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.retweetTweetTransaction(
                testWallet2, testWallet1TweetPda
            ))[0],
            [testWallet2.payer]
        );
    });
    it("Try to retweet the same tweet again", async () => {
        try {
            await anchor.web3.sendAndConfirmTransaction(
                connection,
                (await util.retweetTweetTransaction(
                    testWallet2, testWallet1TweetPda
                ))[0],
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