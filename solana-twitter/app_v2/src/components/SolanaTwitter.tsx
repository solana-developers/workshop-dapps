import { FC, useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import useTwitterAccountStore from "../stores/useProfileStore";
import useTweetsStore from "../stores/useTweetStore";
import { WriteTweet } from './WriteTweet';
import { Tweet } from "./Tweet";
import * as util from '../utils/util';


export const SolanaTwitter: FC = () => {

    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();
    const { connection } = useConnection();

    const balance = useUserSOLBalanceStore((s) => s.balance)
    const { getUserSOLBalance } = useUserSOLBalanceStore()
    
    const [displayName, setName] = useState<string>('');
    const [handle, setHandle] = useState<string>('');

    const { tweets, getAllTweets } = useTweetsStore();
    const { profile, getProfile } = useTwitterAccountStore();

    async function createSolanaTwitterAccount() {
        var newHandle = handle;
        if (newHandle.charAt(0) !== '@') {
            newHandle = "@" + newHandle;
            setHandle("@" + handle);
        }
        if (!wallet) throw("Wallet not connected!")
        const [tx, provider] = await util.createProfileTransaction(wallet, newHandle, displayName);
        const sx = await sendTransaction(tx, provider.connection);
        await provider.connection.confirmTransaction(sx);
        getProfile(wallet);
    };

    const onClickCreateAccount = useCallback(async () => {
        await createSolanaTwitterAccount();
    }, [wallet, handle, displayName]);

    useEffect(() => {
        getProfile(wallet);
        getAllTweets(wallet);
    }, [wallet]);

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
                    {wallet && <p>SOL Balance: {(balance || 0).toLocaleString()}</p>}
                </div>
                { profile ?
                    <div>
                        <WriteTweet 
                            getAllTweets={getAllTweets} 
                            walletPubkey={profile.walletPubkey} 
                            profilePubkey={profile.profilePubkey} 
                            displayName={profile.displayName} 
                            handle={profile.handle} 
                            tweetCount={profile.tweetCount}
                        />
                        {tweets.map((tweet, i) => {
                            return <Tweet 
                                        key={i} 
                                        walletPubkey={tweet.walletPubkey} 
                                        profilePubkey={tweet.profilePubkey} 
                                        tweetPubkey={tweet.tweetPubkey} 
                                        displayName={tweet.displayName} 
                                        handle={tweet.handle} 
                                        message={tweet.message}
                                    />
                        })}
                    </div>
                    :
                    <div>
                        <div>
                            <input 
                                className="text-lg border-2 rounded-lg border-[#6e6e6e] px-6 py-2 mt-16 bg-[#1f1f1f]"
                                type="text" placeholder="Display Name" onChange={e => setName(e.target.value)}/>
                            <input 
                                className="text-lg border-2 rounded-lg border-[#6e6e6e] px-6 py-2 mt-16 ml-4 bg-[#1f1f1f]"
                                type="text" placeholder="Handle (ie. @solana-on-twitter)" onChange={e => setHandle(e.target.value)}/>
                            <button 
                                className="text-lg text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 mt-16 ml-4 bg-[#74a8fc]"
                                onClick={() => onClickCreateAccount()}><span>Create Account</span></button>
                        </div>
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
    );
};
