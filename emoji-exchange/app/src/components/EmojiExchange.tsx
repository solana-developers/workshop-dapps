import { FC, useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import useStoreEmojiStore from 'stores/StoreEmojiStore';
import useUserEmojiStore from 'stores/UserEmojiStore';
import useUserAccountStore from 'stores/UserAccountStore';
import { StoreOrder } from './StoreOrder';
import { UserOrder } from './UserOrder';
import * as util from '../utils/util';
import { DEFAULT_USER_ACCOUNT_STARTING_EBUCKS_BALANCE, MIN_TRADE_COUNT_FOR_CASHOUT } from '../utils/const';

export const EmojiExchange: FC = () => {

  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const [ init, setInit ] = useState<boolean>(false);

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const [ username, setUsername ] = useState<string>('');
  const [ recipientPubkey, setRecipientPubkey ] = useState<anchor.web3.PublicKey>();
  const [ exportEligible, setExportEligible ] = useState<boolean>(false);
  const userAccount = useUserAccountStore((s) => s.userAccount);
  const { getUserAccount } = useUserAccountStore();
  const storeEmojis = useStoreEmojiStore((s) => s.storeEmojis);
  const { getAllStoreEmojis } = useStoreEmojiStore();
  const userEmojis = useUserEmojiStore((s) => s.userEmojis);
  const { getAllUserEmojis } = useUserEmojiStore();

  const onClickInit = useCallback(async () => {
    const [tx, provider] = await util.createUserAccountTransaction(wallet, username);
    const sx = await sendTransaction(tx, provider.connection);
    await provider.connection.confirmTransaction(sx);
    getUserAccount(wallet);
  }, [username, wallet]);

  const onClickCashOut = useCallback(async () => {
    const [tx, provider] = await util.cashOutUser(wallet, recipientPubkey);
    const sx = await sendTransaction(tx, provider.connection);
    await provider.connection.confirmTransaction(sx);
    getUserAccount(wallet);
  }, [wallet, getUserAccount]);

  useEffect(() => {
    var interval = 5000;
    if (!init) {
      interval = 1500;
    };
    const loadPriceData = setInterval(() => {
      getAllStoreEmojis(wallet);
      getAllUserEmojis(wallet);
    }, interval);
    return () => {
      clearInterval(loadPriceData);
    };
  }, [wallet, init, getAllStoreEmojis, getAllUserEmojis]);

  useEffect(() => {
    var interval = 1500;
    const loadUserAccount = setInterval(() => {
      if (userAccount) {
        console.log(`Trade Count: ${userAccount.tradeCount}`);
        if (userAccount.tradeCount >= MIN_TRADE_COUNT_FOR_CASHOUT) setExportEligible(true);
      } else {
        getUserAccount(wallet);
      };
      setInit(true);
    }, interval);
    return () => {
      clearInterval(loadUserAccount);
    };
  }, [wallet, init, getUserAccount]);

  useEffect(() => {
    if (publicKey) {
      console.log(publicKey.toBase58())
      getUserSOLBalance(publicKey, connection)
    }
}, [publicKey, connection, getUserSOLBalance])

  return (
    <div>
      { wallet ?
        <div>
          <div className="text-center">
            {wallet && 
            <div>
              <div className="mx-auto mb-4 p-2 w-64 text-center border-2 rounded-lg border-[#6e6e6e]">
                <p>SOL Balance: {(balance || 0).toLocaleString()}</p>
              </div>
            </div>
            }
            {userAccount &&
            <div>
              <div className="mx-auto mb-4 p-2 w-64 text-center border-2 rounded-lg border-[#6e6e6e]">
                <div>
                  <span>eBucks Balance: {userAccount.ebucksBalance || 0}</span>
                </div>
                <div>
                  <span className="text-[#f0f00a]">eBucks Profit: </span><span>{userAccount.ebucksBalance - DEFAULT_USER_ACCOUNT_STARTING_EBUCKS_BALANCE || 0}</span>
                </div>
              </div>
            </div>
            }
          </div>
          {exportEligible && !userAccount.cashedOut &&
            <div className="mx-auto mb-4 p-6 text-center">
              <p>Congratulations!</p>
              <p>You can now cash out your SOL balance!</p>
              <p><span className="font-bold text-[#d4005c]">Warning:</span> You can only do this once.</p>
              <input 
                type="text" 
                className="input input-bordered w-60 m-2" 
                placeholder="Enter PublicKey to cash out to:"
                onChange={(e) => setRecipientPubkey(new anchor.web3.PublicKey(e.target.value))}
              />
              <button
                className="px-8 m-2 w-40 btn animate-pulse bg-[#d4005c] hover:from-pink-500 hover:to-yellow-500 ..."
                onClick={() => onClickCashOut()}>
                  <span>Cash Out</span>
              </button>
            </div>
          }
          {userAccount ? 
            <div>
              { userAccount.cashedOut ?
                <div className="mx-auto mb-4 ml-2 p-6 border-2 rounded-lg border-[#d4005c] text-center">
                  <p>Looks like you've already cashed out.</p>
                  <p>Thanks for playing!</p>
              </div>
                :
                <div className="flex flex-row max-w-full">
                  <div className="ml-2 p-6 border-2 rounded-lg border-[#6e6e6e]">
                    <span className="mb-2 text-left text-2xl">Store emojis:</span>
                    <div className="mt-4">
                      <span className="ml-8">Qty</span>
                      <span className="ml-8">Price</span>
                    </div>
                    <div className="mt-2">
                      {storeEmojis.map((s, i) => { 
                        return <StoreOrder key={i} getAllStoreEmojis={getAllStoreEmojis} getAllUserEmojis={getAllUserEmojis} emojiName={s.emojiName} display={s.display} price={s.price} balance={s.balance} />
                      })}
                    </div>
                  </div>
                  <div className="ml-2 p-6 border-2 rounded-lg border-[#6e6e6e]">
                    <span className="mb-2 text-left text-2xl">Emojis owned by <span className="text-[#00d466]">{userAccount.username}</span>:</span>
                    <div className="mt-4">
                      <span className="ml-8">Qty</span>
                      <span className="ml-8">Cost Avg</span>
                    </div>
                    <div className="mt-4">
                      {userEmojis.map((u, i) => { 
                        if (u.balance > 0) {
                          return <UserOrder key={i} getAllStoreEmojis={getAllStoreEmojis} getAllUserEmojis={getAllUserEmojis} emojiName={u.emojiName} display={u.display} balance={u.balance} costAverage={u.costAverage} />
                        };
                      })}
                    </div>
                  </div>
                </div> 
              }
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
            <div className="text-lg border-2 rounded-lg border-[#6e6e6e] p-6 mt-16 bg-[#1f1f1f]">
              <p>Connect your wallet to log in/sign up!</p>
            </div>
          </div>
          }
    </div>
  )
}