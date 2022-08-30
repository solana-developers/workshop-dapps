import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ProfileObject } from "../models/types";
import * as util from '../utils/util';

interface ProfileStore extends State {
    profile: ProfileObject;
    getProfile: (wallet: AnchorWallet | undefined) => void
}

const useProfileStore = create<ProfileStore>((set, _get) => ({
    profile: null,
    getProfile: async (wallet: AnchorWallet | undefined) => {
        let profile: ProfileObject = null;
        try {
            if (!wallet) throw("Wallet not connected!");
            profile = await util.getProfile(wallet);
        } catch (e) {
            console.log(e);
        };
        set((s) => ({
            profile: profile
        }));
    },
}));

export default useProfileStore;