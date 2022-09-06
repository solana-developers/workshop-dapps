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
        <div className="text-lg border-2 rounded-lg border-[#6e6e6e] px-6 py-2 my-6 bg-[#1f1f1f]">
            <p className="text-[#a3a3a3]">
                {props.walletPubkey.toString()}
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
                onClick={() => onClickPublishTweet(message)}><span>Publish</span></button>
        </div>
    );
};