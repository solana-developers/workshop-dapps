import { FC, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import useProfitLeaderStore from 'stores/useProfitLeadersStore';


export const ProfitLeaders: FC = () => {

  const wallet = useAnchorWallet();

  const { profitLeaders, getAllProfitLeaders } = useProfitLeaderStore();


  useEffect(() => {
    getAllProfitLeaders(wallet);
  }, []);

  useEffect(() => {
    setInterval(() => getAllProfitLeaders(wallet), 5000);
  }, [wallet, getAllProfitLeaders]);


  return (
    <div>
      { wallet &&
        <div>
          { profitLeaders
            .sort((a, b) => a.ebucksProfit < b.ebucksProfit ? 1 : -1)
            .map((p, i) => { 
              return (
                <div key={i} className="ml-2 my-2 p-6 border-2 rounded-lg border-[#6e6e6e]">
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
              )
            })
          }
        </div>
      }
    </div>
  )
}