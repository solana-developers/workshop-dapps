import { FC, useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import useProfitLeaderStore from 'stores/profitLeadersStore';
import * as util from '../utils/util';
import { DEFAULT_USER_STARTING_EBUCKS_BALANCE, MIN_TRADE_COUNT_FOR_CASHOUT } from '../utils/const';

export const ProfitLeaders: FC = () => {

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();

  const { profitLeaders, getAllProfitLeaders } = useProfitLeaderStore();


  useEffect(() => {
    setInterval(() => getAllProfitLeaders(wallet), 5000);
  }, [wallet, getAllProfitLeaders]);


  return (
    <div>
      { wallet &&
      <div>
        { profitLeaders
          .sort((a, b) => a.ebucksProfit > b.ebucksProfit ? 1 : -1)
          .map((p, i) => { 
            return (
              <div className="ml-2 p-6 border-2 rounded-lg border-[#6e6e6e]">
                <div key={i}>
                  <div className="text-sm text-[#a3a3a3]">
                    <span>{p.pubkey}</span>
                  </div>
                  <div className="mt-2 text-xl">
                    <span className="ml-2 text-[#19c2ff]">{p.username}</span>
                    <span className="ml-6">Profit: </span>
                    <span className="ml-2 text-[#03fc30]">{p.ebucksProfit}</span>
                    <span className="ml-6">Balance: </span>
                    <span className="ml-2 text-[#fcba03]">{p.ebucksBalance}</span>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    }
    </div>
  )
}