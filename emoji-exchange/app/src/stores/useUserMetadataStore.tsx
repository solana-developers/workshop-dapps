import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { UserMetadataObject } from "../models/types";
import * as util from '../utils/util';

interface UserMetadataStore extends State {
    userMetadata: UserMetadataObject;
    getUserMetadata: (wallet: AnchorWallet | undefined) => void
}

const useUserMetadataStore = create<UserMetadataStore>((set, _get) => ({
    userMetadata: null,
    getUserMetadata: async (wallet: AnchorWallet | undefined) => {
        let userMetadata: UserMetadataObject = null;
        try {
            if (!wallet) throw("Wallet not connected!");
            userMetadata = await util.getUserMetadata(wallet);
            console.log(`User Metadata: ${userMetadata.username}`);
        } catch (e) {
            console.log(e);
        };
        set((s) => ({
            userMetadata: userMetadata
        }));
    },
}));

export default useUserMetadataStore;