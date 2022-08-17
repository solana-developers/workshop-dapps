import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { StoreEmojiObject } from "../models/types";
import * as util from '../utils/util';

interface StoreEmojiStore extends State {
    storeEmojis: StoreEmojiObject[];
    getAllStoreEmojis: (wallet: AnchorWallet | undefined) => void
}

const useStoreEmojiStore = create<StoreEmojiStore>((set, _get) => ({
    storeEmojis: [],
    getAllStoreEmojis: async (wallet: AnchorWallet | undefined) => {
        let storeEmojis: StoreEmojiObject[] = [];
        try {
            if (!wallet) throw("Wallet not connected!");
            storeEmojis = await util.loadStore(wallet);
            console.log(`Successfully loaded store.`);
        } catch (e) {
            console.log(e);
        };
        set((s) => ({
            storeEmojis: storeEmojis
        }));
    },
}));

export default useStoreEmojiStore;