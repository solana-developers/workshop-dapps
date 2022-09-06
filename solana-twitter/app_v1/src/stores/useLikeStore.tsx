import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as util from '../utils/util';


interface LikesStore extends State {
    tweetLiked: boolean;
    getTweetLiked: (
        wallet: AnchorWallet | undefined,
        tweetPubkey: PublicKey,
    ) => void
}

const useLikesStore = create<LikesStore>((set, _get) => ({
    tweetLiked: false,
    getTweetLiked: async (
        wallet: AnchorWallet | undefined,
        tweetPubkey: PublicKey,
    ) => {
        let tweetLiked: boolean = false;
        console.log(`Checking like for tweet: ${tweetPubkey}`);
        try {
            if (!wallet) throw("Wallet not connected!");
            const like = await util.getLike(wallet, tweetPubkey);
            tweetLiked = like ? true : false;
        } catch (_) {};
        console.log(tweetLiked);
        set((s) => ({
            tweetLiked: tweetLiked
        }));
    },
}));

export default useLikesStore;