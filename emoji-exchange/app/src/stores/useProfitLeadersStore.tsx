import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ProfitLeaderObject } from "../models/types";
import { getProfitLeaders } from '../utils/util';

interface ProfitLeaderStore extends State {
    profitLeaders: ProfitLeaderObject[];
    getAllProfitLeaders: (wallet: AnchorWallet | undefined) => void
}

const useProfitLeaderStore = create<ProfitLeaderStore>((set, _get) => ({
    profitLeaders: [],
    getAllProfitLeaders: async (wallet: AnchorWallet | undefined) => {
        let profitLeaders: ProfitLeaderObject[] = [];
        try {
            profitLeaders = await getProfitLeaders(wallet);
            set((s) => ({
                profitLeaders: profitLeaders
            }));
            console.log(`Successfully loaded profit leaders.`);
        } catch (e) {
            console.log(e);
        };
    },
}));

export default useProfitLeaderStore;