import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ProfileObject } from "../models/types";
import * as util from '../utils/util';

interface TwitterAccountStore extends State {
    twitterAccount: ProfileObject;
    getTwitterAccount: (wallet: AnchorWallet | undefined) => void
}

const useTwitterAccountStore = create<TwitterAccountStore>((set, _get) => ({
    twitterAccount: null,
    getTwitterAccount: async (wallet: AnchorWallet | undefined) => {
        let twitterAccount: ProfileObject = null;
        try {
            if (!wallet) throw("Wallet not connected!");
            twitterAccount = await util.getProfile(wallet);
        } catch (e) {
            console.log(e);
        };
        set((s) => ({
            twitterAccount: twitterAccount
        }));
    },
}));

export default useTwitterAccountStore;