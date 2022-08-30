import * as anchor from "@project-serum/anchor";
import * as constants from './const';


export class SeedUtil {

    program: anchor.Program;
    profilePda: anchor.web3.PublicKey;
    likePda: anchor.web3.PublicKey;
    likeMintPda: anchor.web3.PublicKey;
    likeMetadataPda: anchor.web3.PublicKey;
    likeMintAuthorityPda: anchor.web3.PublicKey;
    retweetPda: anchor.web3.PublicKey;
    retweetMintPda: anchor.web3.PublicKey;
    retweetMetadataPda: anchor.web3.PublicKey;
    retweetMintAuthorityPda: anchor.web3.PublicKey;

    constructor(program: anchor.Program) {
        this.program = program;
    };

    async derivePda(seeds: Buffer[]) {
        return (await anchor.web3.PublicKey.findProgramAddress(
            seeds, this.program.programId
        ))[0]
    }

    async deriveMetadataPda(seeds: Buffer[]) {
        return (await anchor.web3.PublicKey.findProgramAddress(
            seeds, constants.TOKEN_METADATA_PROGRAM_ID
        ))[0]
    }

    async init(
        walletPubkey: anchor.web3.PublicKey,
    ) {
        this.profilePda = await this.derivePda([
            Buffer.from(constants.PROFILE_SEED_PREFIX),
            walletPubkey.toBuffer(), 
        ]);
        this.likeMintPda = await this.derivePda([
            Buffer.from(constants.LIKE_MINT_SEED_PREFIX),
        ]);
        this.likeMetadataPda = await this.deriveMetadataPda([
            Buffer.from("metadata"),
            constants.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            this.likeMintPda.toBuffer(),
        ]);
        this.likeMintAuthorityPda = await this.derivePda([
            Buffer.from(constants.LIKE_MINT_AUTHORITY_SEED_PREFIX),
            this.likeMintPda.toBuffer(),
        ]);
        this.retweetMintPda = await this.derivePda([
            Buffer.from(constants.RETWEET_MINT_SEED_PREFIX), 
        ]);
        this.retweetMetadataPda = await this.deriveMetadataPda([
            Buffer.from("metadata"),
            constants.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            this.retweetMintPda.toBuffer(),
        ]);
        this.retweetMintAuthorityPda = await this.derivePda([
            Buffer.from(constants.RETWEET_MINT_AUTHORITY_SEED_PREFIX),
            this.retweetMintPda.toBuffer(), 
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

    async getLikeTokenAccount(
        walletPubkey: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> {
        return await anchor.utils.token.associatedAddress({
            mint: this.likeMintPda, 
            owner: walletPubkey,
        });
    }

    async getRetweetTokenAccount(
        walletPubkey: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> {
        return await anchor.utils.token.associatedAddress({
            mint: this.retweetMintPda, 
            owner: walletPubkey,
        });
    }

    async getWalletAndLikeTokenAccountFromTweet(
        tweetPubkey: anchor.web3.PublicKey
    ): Promise<[
        anchor.web3.PublicKey,
        anchor.web3.PublicKey,
    ]> {
        const authorWalletPubkey = (
            await this.program.account.solanaTweet.fetch(tweetPubkey)
        ).walletPubkey as anchor.web3.PublicKey;
        return [
            authorWalletPubkey,
            await anchor.utils.token.associatedAddress({
                mint: this.likeMintPda, 
                owner: authorWalletPubkey
            })
        ];
    }

    async getWalletAndRetweetTokenAccountFromTweet(
        tweetPubkey: anchor.web3.PublicKey
    ): Promise<[
        anchor.web3.PublicKey,
        anchor.web3.PublicKey,
    ]> {
        const authorWalletPubkey = (
            await this.program.account.solanaTweet.fetch(tweetPubkey)
        ).walletPubkey as anchor.web3.PublicKey;
        return [
            authorWalletPubkey,
            await anchor.utils.token.associatedAddress({
                mint: this.retweetMintPda, 
                owner: authorWalletPubkey
            })
        ];
    }
}
