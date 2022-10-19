import { FC, useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import useUserMetadataStore from 'stores/useUserMetadataStore';
import * as util from '../utils/util';
import { Store } from './Store';
import { UserStore } from './UserStore';
import { ClaimPrize } from './ClaimPrize';
import useUserEmojiStore from 'stores/useUserEmojiStore';
import { ProfitLeaders } from './ProfitLeaders';
import useGameStore from 'stores/useGameStore';
import useProfitLeaderStore from 'stores/useProfitLeadersStore';


export const EmojiExchange: FC = () => {

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();

  const { game, getGame } = useGameStore();
  const { profitLeaders, getAllProfitLeaders } = useProfitLeaderStore();

  const [ username, setUsername ] = useState<string>('');
  const { userMetadata, getUserMetadata } = useUserMetadataStore();
  const { userEmojis, getAllUserEmojis } = useUserEmojiStore();

  const [ showExchange, setShowExchange ] = useState<boolean>(true);


  const onClickInit = useCallback(async () => {
    const tx = await util.createUserMetadataTransaction(wallet, username);
    const sx = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sx);
    getUserMetadata(wallet);
  }, [username, wallet]);


  useEffect(() => {
    getUserMetadata(wallet);
    getGame(wallet);
    getAllProfitLeaders(wallet);
  }, [wallet])


  return (
    <div>
      { wallet && game ?
        <div>
          { showExchange ? 
            <div>
              <div className='flex flex-col mb-4 mx-auto'>
                <button className="text-md rounded-lg bg-[#00d466] px-6 py-2 mx-auto" 
                    onClick={() => setShowExchange(false)}>
                        <span>Show Profit Leaders</span>
                </button>
              </div>
              { game.isActive ?
                <div>
                  {userMetadata ? 
                    <div>
                      <ClaimPrize 
                        profitLeaders={profitLeaders}
                        getAllProfitLeaders={getAllProfitLeaders}
                        userMetadata={userMetadata}
                        getUserMetadata={getUserMetadata}
                        game={game}
                        getGame={getGame}
                      />
                      <div className="flex flex-row max-w-full">
                        <Store 
                          getUserMetadata={getUserMetadata}
                          getAllUserEmojis={getAllUserEmojis}
                          wallet={wallet}
                        />
                        <UserStore 
                          getUserMetadata={getUserMetadata}
                          wallet={wallet}
                          username={userMetadata.username}
                        />
                      </div> 
                    </div>
                  :
                    <div>
                      <input 
                        type="text" 
                        className="input input-bordered max-w-xs m-2" 
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <button
                        className="px-8 m-2 btn bg-gradient-to-br from-[#f0940a] to-[#f0f00a] hover:from-pink-500 hover:to-yellow-500 ..."
                        onClick={() => onClickInit()}>
                          <span>Initialize User</span>
                      </button>
                    </div>
                  }
                </div>
              :
                <div>
                  <p>The game has ended. Thanks for playing!</p>
                </div>
              }
            </div>
          :
            <div className='flex flex-col mb-4 mx-auto'>
              <button className="text-md rounded-lg bg-[#00d466] px-6 py-2 mx-auto" 
                  onClick={() => setShowExchange(true)}>
                      <span>Show Exchange</span>
              </button>
              <ProfitLeaders
                profitLeaders={profitLeaders}
                getAllProfitLeaders={getAllProfitLeaders}
              />
            </div>
          }
        </div>
        :
        <div>
          <div className="text-lg border-2 rounded-lg border-[#6e6e6e] p-6 mt-16 bg-[#1f1f1f]">
            <p>Connect your wallet to log in/sign up!</p>
          </div>
        </div>
      }
    </div>
  )
}