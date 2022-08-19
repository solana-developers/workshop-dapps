import * as anchor from "@project-serum/anchor";
import * as constants from './const';



export async function deriveProfileSeeds(
    walletPubkey: anchor.web3.PublicKey,
    program: anchor.Program,
): Promise<[anchor.web3.PublicKey]> {

    const [profilePda, _profilePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.PROFILE_SEED_PREFIX),
            walletPubkey.toBuffer(), 
        ],
        program.programId,
    );
    return [profilePda];
};


export async function deriveTweetSeeds(
    walletPubkey: anchor.web3.PublicKey,
    program: anchor.Program,
): Promise<[anchor.web3.PublicKey, anchor.web3.PublicKey]> {

    const [profilePda, _profilePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.PROFILE_SEED_PREFIX),
            walletPubkey.toBuffer(), 
        ],
        program.programId,
    );
    const tweetCount = (await program.account.solanaTwitterProfile.fetch(profilePda)).tweetCount as number;
    const [tweetPda, _tweetPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.TWEET_SEED_PREFIX),
            profilePda.toBuffer(), 
            Buffer.from((tweetCount + 1).toString()),
        ],
        program.programId,
    );
    return [profilePda, tweetPda];
};


export async function deriveLikeSeeds(
    tweetPubkey: anchor.web3.PublicKey,
    walletPubkey: anchor.web3.PublicKey,
    program: anchor.Program,
): Promise<[
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
]> {

    const [profilePda, _profilePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.PROFILE_SEED_PREFIX),
            walletPubkey.toBuffer(), 
        ],
        program.programId,
    );
    const [likePda, _likePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.LIKE_SEED_PREFIX),
            profilePda.toBuffer(),
            tweetPubkey.toBuffer(),
        ],
        program.programId,
    );
    const [likeMintPda, likeMintAuthorityPda] = await deriveLikeMintSeeds(program);
    const [authorWalletPubkey, authorTokenAccountPubkey] = await deriveAtaForTweet(tweetPubkey, likeMintPda, program);
    return [
        profilePda, 
        likePda, 
        likeMintPda, 
        likeMintAuthorityPda, 
        authorWalletPubkey,
        authorTokenAccountPubkey,
    ];
};


export async function deriveLikeMintSeeds(
    program: anchor.Program,
): Promise<[anchor.web3.PublicKey, anchor.web3.PublicKey]> {

    const [likeMintPda, _likeMintPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.LIKE_MINT_SEED_PREFIX),
        ],
        program.programId,
    );
    const [likeMintAuthorityPda, _likeMintAuthorityPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.LIKE_MINT_AUTHORITY_SEED_PREFIX),
            likeMintPda.toBuffer(), 
        ],
        program.programId,
    );
    return [likeMintPda, likeMintAuthorityPda];
};


export async function deriveRetweetSeeds(
    tweetPubkey: anchor.web3.PublicKey,
    walletPubkey: anchor.web3.PublicKey,
    program: anchor.Program,
): Promise<[
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey,
]> {

    const [profilePda, _profilePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.PROFILE_SEED_PREFIX),
            walletPubkey.toBuffer(), 
        ],
        program.programId,
    );
    const [retweetPda, _retweetPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.RETWEET_SEED_PREFIX),
            profilePda.toBuffer(),
            tweetPubkey.toBuffer(),
        ],
        program.programId,
    );
    const [retweetMintPda, retweetMintAuthorityPda] = await deriveRetweetMintSeeds(program);
    const [authorWalletPubkey, authorTokenAccountPubkey] = await deriveAtaForTweet(tweetPubkey, retweetMintPda, program);
    return [
        profilePda, 
        retweetPda, 
        retweetMintPda, 
        retweetMintAuthorityPda, 
        authorWalletPubkey, 
        authorTokenAccountPubkey, 
    ];
};


export async function deriveRetweetMintSeeds(
    program: anchor.Program,
): Promise<[anchor.web3.PublicKey, anchor.web3.PublicKey]> {

    const [retweetMintPda, _retweetMintPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.RETWEET_MINT_SEED_PREFIX),
        ],
        program.programId,
    );
    const [retweetMintAuthorityPda, _retweetMintAuthorityPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.RETWEET_MINT_AUTHORITY_SEED_PREFIX),
            retweetMintPda.toBuffer(), 
        ],
        program.programId,
    );
    return [retweetMintPda, retweetMintAuthorityPda];
};


export async function deriveAtaForTweet(
    tweetPubkey: anchor.web3.PublicKey, mint: anchor.web3.PublicKey, program: anchor.Program
): Promise<[anchor.web3.PublicKey, anchor.web3.PublicKey]> {

    const authorWalletPubkey = (
        await program.account.solanaTweet.fetch(tweetPubkey)
    ).walletPubkey as anchor.web3.PublicKey;
    const authorTokenAccountPubkey = await anchor.utils.token.associatedAddress({
        mint: mint,
        owner: authorWalletPubkey,
    });
    return [authorWalletPubkey, authorTokenAccountPubkey];
}