import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { UserEmojiObject } from "../models/types";
import * as util from '../utils/util';

interface UserEmojiStore extends State {
    userEmojis: UserEmojiObject[];
    getAllUserEmojis: (wallet: AnchorWallet | undefined) => void
}

const useUserEmojiStore = create<UserEmojiStore>((set, _get) => ({
    userEmojis: [],
    getAllUserEmojis: async (wallet: AnchorWallet | undefined) => {
        let userEmojis: UserEmojiObject[] = [];
        try {
            if (!wallet) throw("Wallet not connected!");
            userEmojis = await util.loadUserStore(wallet);
            console.log(`Successfully loaded user store.`);
        } catch (e) {
            console.log(e);
        };
        set((s) => ({
            userEmojis: userEmojis
        }));
    },
}));

export default useUserEmojiStore;