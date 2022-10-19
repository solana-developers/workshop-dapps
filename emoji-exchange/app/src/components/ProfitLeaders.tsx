import { FC, useEffect } from 'react';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { ProfitLeaderObject } from 'models/types';


interface ProfitLeadersProps {
  profitLeaders: ProfitLeaderObject[],
  getAllProfitLeaders: (wallet: AnchorWallet | undefined) => void,
}

export const ProfitLeaders: FC<ProfitLeadersProps> = (props: ProfitLeadersProps) => {

  const wallet = useAnchorWallet();

  useEffect(() => {
    setInterval(() => props.getAllProfitLeaders(wallet), 5000);
  }, [wallet, props.getAllProfitLeaders]);


  return (
    <div>
      { wallet &&
        <div>
          { props.profitLeaders
            .sort((a, b) => a.ebucksProfit < b.ebucksProfit ? 1 : -1)
            .map((p, i) => { 
              return (
                <div key={i} className="ml-2 my-2 p-6 border-2 rounded-lg border-[#6e6e6e]">
                  <div className="text-sm text-[#a3a3a3]">
                    <span>{p.authority.toString()}</span>
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