import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as util from '../utils/util';


interface RetweetsStore extends State {
    tweetRetweeted: boolean;
    getTweetRetweeted: (
        wallet: AnchorWallet | undefined,
        tweetPubkey: PublicKey,
    ) => void
}

const useRetweetsStore = create<RetweetsStore>((set, _get) => ({
    tweetRetweeted: false,
    getTweetRetweeted: async (
        wallet: AnchorWallet | undefined,
        tweetPubkey: PublicKey,
    ) => {
        let tweetRetweeted: boolean = false;
        console.log(`Checking retweet for tweet: ${tweetPubkey}`);
        try {
            if (!wallet) throw("Wallet not connected!");
            const retweet = await util.getRetweet(wallet, tweetPubkey);
            tweetRetweeted = retweet ? true : false;
        } catch (_) {};
        console.log(tweetRetweeted);
        set((s) => ({
            tweetRetweeted: tweetRetweeted
        }));
    },
}));

export default useRetweetsStore;