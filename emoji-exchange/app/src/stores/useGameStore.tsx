import create, { State } from "zustand";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { GameObject } from "../models/types";
import * as util from '../utils/util';

interface GameStore extends State {
    game: GameObject;
    getGame: (wallet: AnchorWallet | undefined) => void
}

const useGameStore = create<GameStore>((set, _get) => ({
    game: null,
    getGame: async (wallet: AnchorWallet | undefined) => {
        let game: GameObject = null;
        try {
            if (!wallet) throw("Wallet not connected!");
            game = await util.getGame(wallet);
        } catch (e) {
            console.log(e);
        };
        set((s) => ({
            game: game
        }));
    },
}));

export default useGameStore;