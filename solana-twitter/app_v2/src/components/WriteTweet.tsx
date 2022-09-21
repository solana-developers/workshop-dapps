import { FC, useCallback, useState } from "react";
import { 
    AnchorWallet, 
    useAnchorWallet, 
    useConnection, 
    useWallet 
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as util from '../utils/util';


interface WriteTweetProps {
    getAllTweets: (wallet: AnchorWallet | undefined) => void,
    walletPubkey: PublicKey, 
    profilePubkey: PublicKey, 
    displayName: string,
    handle: string,
    tweetCount: number,
};

export const WriteTweet: FC<WriteTweetProps> = (props: WriteTweetProps) => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const [message, setMessage] = useState('');


    const onClickPublishTweet = useCallback(async (message: string) => {
        const tx = await util.createTweetTransaction(wallet, message);
        await connection.confirmTransaction(await sendTransaction(tx, connection));
        props.getAllTweets(wallet);
    }, [wallet, props]);


    return(
        <div className="text-sm border-2 rounded-lg border-[#74a8fc] px-6 py-2 my-6 bg-[#1f1f1f]">
            <p>
                <span className="text-[#a3a3a3] text-sm">
                    {props.walletPubkey.toString().substring(0,32)}
                </span>
                <span className="text-[#a3a3a3] text-sm">
                    ...
                </span>
            </p>
            <p className="text-xl mb-2">
                <span className="text-[#29d688]">
                    {props.displayName}
                </span>
                <span className="ml-10 text-[#74a8fc]">
                    {props.handle}
                </span>
            </p>
            <input 
                className="w-96 h-8 text-black px-4 rounded-md" 
                placeholder="What's on your mind?" onChange={(e) => setMessage(e.target.value)}/>
            <button 
                className="text-md text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-1 mt-2 ml-4 bg-[#29d688]"
                onClick={() => onClickPublishTweet(message)}><span>Publish</span></button>
        </div>
    );
};