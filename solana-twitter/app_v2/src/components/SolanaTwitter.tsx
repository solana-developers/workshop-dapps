import { FC, useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import useTwitterAccountStore from "../stores/useProfileStore";
import useTweetsStore from "../stores/useTweetStore";
import { WriteTweet } from './WriteTweet';
import { Tweet } from "./Tweet";
import * as util from '../utils/util';


export const SolanaTwitter: FC = () => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const { tweets, getAllTweets } = useTweetsStore();
    const { profile, getProfile } = useTwitterAccountStore();

    const balance = useUserSOLBalanceStore((s) => s.balance)
    const { getUserSOLBalance } = useUserSOLBalanceStore()
    
    const [displayName, setName] = useState<string>('');
    const [handle, setHandle] = useState<string>('');


    const onClickCreateAccount = useCallback(async () => {
        var newHandle = handle;
        if (newHandle.charAt(0) !== '@') {
            newHandle = "@" + newHandle;
            setHandle("@" + handle);
        };
        const tx = await util.createProfileTransaction(wallet, newHandle, displayName);
        await connection.confirmTransaction(await sendTransaction(tx, connection));
        getProfile(wallet);
    }, [wallet, handle, displayName, getProfile]);


    useEffect(() => {
        getProfile(wallet);
        getAllTweets(wallet);
    }, [wallet, getProfile, getAllTweets]);

    useEffect(() => {
        if (publicKey) {
            console.log(publicKey.toBase58())
            getUserSOLBalance(publicKey, connection)
        }
    }, [publicKey, connection, getUserSOLBalance])

    
    return (
        <div>
            <h1 className="text-center text-5xl mb-2 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#74a8fc] to-[#c6ecf7]">
                Solana Twitter
            </h1>
            { wallet ?
            <div>
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
                                        getAllTweets={getAllTweets}
                                        walletPubkey={tweet.walletPubkey} 
                                        profilePubkey={tweet.profilePubkey} 
                                        tweetPubkey={tweet.tweetPubkey} 
                                        displayName={tweet.displayName} 
                                        handle={tweet.handle} 
                                        message={tweet.message}
                                        likeCount={tweet.likeCount}
                                        retweetCount={tweet.retweetCount}
                                        tweetLiked={tweet.tweetLiked}
                                        tweetRetweeted={tweet.tweetRetweeted}
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
