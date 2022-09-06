import * as anchor from "@project-serum/anchor";
import * as constants from './const';


export class SeedUtil {

    program: anchor.Program;
    profilePda: anchor.web3.PublicKey;
    likePda: anchor.web3.PublicKey;
    likeMetadataPda: anchor.web3.PublicKey;
    retweetPda: anchor.web3.PublicKey;

    constructor(program: anchor.Program) {
        this.program = program;
    };

    async derivePda(seeds: Buffer[]) {
        return (await anchor.web3.PublicKey.findProgramAddress(
            seeds, this.program.programId
        ))[0]
    }

    async init(
        walletPubkey: anchor.web3.PublicKey,
    ) {
        this.profilePda = await this.derivePda([
            Buffer.from(constants.PROFILE_SEED_PREFIX),
            walletPubkey.toBuffer(), 
        ]);
    }

    async getNextTweetPda(): Promise<anchor.web3.PublicKey> {
        const tweetCount = (
            await this.program.account.solanaTwitterProfile.fetch(this.profilePda)
        ).tweetCount as number;
        return await this.derivePda([
            Buffer.from(constants.TWEET_SEED_PREFIX),
            this.profilePda.toBuffer(), 
            Buffer.from((tweetCount + 1).toString()),
        ]);
    }

    async getLatestTweetPda(): Promise<anchor.web3.PublicKey> {
        const tweetCount = (
            await this.program.account.solanaTwitterProfile.fetch(this.profilePda)
        ).tweetCount as number;
        return await this.derivePda([
            Buffer.from(constants.TWEET_SEED_PREFIX),
            this.profilePda.toBuffer(), 
            Buffer.from((tweetCount).toString()),
        ]);
    }

    async getLikePda(
        tweetPubkey: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> {
        return await this.derivePda([
            Buffer.from(constants.LIKE_SEED_PREFIX),
            this.profilePda.toBuffer(),
            tweetPubkey.toBuffer(),
        ]);
    }

    async getRetweetPda(
        tweetPubkey: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> {
        return await this.derivePda([
            Buffer.from(constants.RETWEET_SEED_PREFIX),
            this.profilePda.toBuffer(),
            tweetPubkey.toBuffer(),
        ]);
    }
}
