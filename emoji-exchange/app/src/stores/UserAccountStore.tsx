import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { UserAccountObject } from "../models/types";
import * as util from '../utils/util';

interface UserAccountStore extends State {
    userAccount: UserAccountObject;
    getUserAccount: (wallet: AnchorWallet | undefined) => void
}

const useUserAccountStore = create<UserAccountStore>((set, _get) => ({
    userAccount: null,
    getUserAccount: async (wallet: AnchorWallet | undefined) => {
        let userAccount: UserAccountObject = null;
        try {
            if (!wallet) throw("Wallet not connected!");
            userAccount = await util.getUserAccount(wallet);
            console.log(`User Account: ${userAccount.username}`);
        } catch (e) {
            console.log(e);
        };
        set((s) => ({
            userAccount: userAccount
        }));
    },
}));

export default useUserAccountStore;