import * as anchor from "@project-serum/anchor";
import * as constants from './const';


export class SeedUtil {

    USDC_MINT_ADDRESS: anchor.web3.PublicKey = new anchor.web3.PublicKey(
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    );

    program: anchor.Program;
    gamePda: anchor.web3.PublicKey;
    gamePdaBump: number;
    masterUsdcTokenAccount: anchor.web3.PublicKey;
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

    async deriveUsdcTokenAccount(pubkey: anchor.web3.PublicKey) {
        return await anchor.utils.token.associatedAddress({
            mint: this.USDC_MINT_ADDRESS,
            owner: pubkey,
        });
    }

    async init() {
        [this.gamePda, this.gamePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [ Buffer.from(constants.GAME_SEED_PREFIX) ], 
            this.program.programId
        );
        this.masterUsdcTokenAccount = await this.deriveUsdcTokenAccount(this.gamePda);
    }

    async getStoreEmojiPda(
        emojiSeed: string
    ): Promise<anchor.web3.PublicKey> {
        return await this.derivePda([
            Buffer.from(constants.STORE_EMOJI_SEED_PREFIX),
            Buffer.from(emojiSeed),
        ]);
    }

    async getUserMetadataPda(
        walletPubkey: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> {
        return await this.derivePda([
            Buffer.from(constants.USER_METADATA_SEED_PREFIX),
            walletPubkey.toBuffer(),
        ]);
    }

    async getUserEmojiPda(
        emojiSeed: string,
        walletPubkey: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> {
        return await this.derivePda([
            Buffer.from(constants.USER_EMOJI_SEED_PREFIX),
            Buffer.from(emojiSeed),
            walletPubkey.toBuffer(),
        ]);
    }
}
