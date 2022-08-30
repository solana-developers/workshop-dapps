import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { TweetObject } from "../models/types";
import * as util from '../utils/util';

interface TweetsStore extends State {
    tweets: TweetObject[];
    getAllTweets: (wallet: AnchorWallet | undefined) => void
}

const useTweetsStore = create<TweetsStore>((set, _get) => ({
    tweets: [],
    getAllTweets: async (wallet: AnchorWallet | undefined) => {
        let tweets: TweetObject[] = [];
        try {
            if (!wallet) throw("Wallet not connected!");
            tweets = await util.getAllTweets(wallet);
        } catch (e) {
            console.log(e);
        };
        set((s) => ({
            tweets: tweets
        }));
    },
}));

export default useTweetsStore;