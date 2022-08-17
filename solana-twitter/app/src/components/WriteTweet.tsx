import { FC, useCallback, useState } from "react";
import { AnchorWallet, useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { TweetObject } from "../models/types";
import * as anchor from "@project-serum/anchor";
import * as util from '../utils/util';


interface WriteTweetProps {
    getAllTweets: (wallet: AnchorWallet | undefined) => void,
    publicKey: anchor.web3.PublicKey,
    displayName: string,
    handle: string,
    tweetCount: number,
};

export const WriteTweet: FC<WriteTweetProps> = (props: WriteTweetProps) => {

    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const [displayName, setName] = useState(props.displayName);
    const [handle, setHandle] = useState(props.handle);
    const [tweetCount, setTweetCount] = useState(props.tweetCount);

    const [message, setMessage] = useState('');

    async function publishTweet(message: string) {
        if (!wallet) throw("Wallet not connected!");
        const [tx, provider] = await util.createTweetTransaction(wallet, message);
        const sx = await sendTransaction(tx, provider.connection);
        await provider.connection.confirmTransaction(sx);
    };

    const onClickPublishTweet = useCallback(async (form: TweetObject) => {
        await publishTweet(form.message);
        props.getAllTweets(wallet);
    }, [wallet, props]);

    return(
        <div className="text-lg border-2 rounded-lg border-[#6e6e6e] px-6 py-2 my-6 bg-[#1f1f1f]">
            <p className="text-[#a3a3a3]">
                {props.publicKey.toString()}
            </p>
            <p className="text-2xl my-2">
                <span className="text-[#29d688]">
                    {props.displayName}
                </span>
                <span className="ml-10 text-[#74a8fc]">
                    {props.handle}
                </span>
            </p>
            <input 
                className="w-96 h-12 text-black px-4 rounded-md" 
                placeholder="What's on your mind?" onChange={(e) => setMessage(e.target.value)}/>
            <button 
                className="text-lg text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 mt-2 ml-4 bg-[#74a8fc]"
                onClick={() => onClickPublishTweet(
                {
                    publicKey: props.publicKey,
                    displayName: props.displayName,
                    handle: props.handle,
                    message: message,
                }
            )}><span>Publish</span></button>
        </div>
    );
};