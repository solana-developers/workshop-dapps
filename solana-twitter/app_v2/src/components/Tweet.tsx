import { FC, useCallback, useEffect, useState } from "react";
import { 
    AnchorWallet, 
    useAnchorWallet, 
    useConnection, 
    useWallet 
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { 
    createLikeTransaction, 
    createRetweetTransaction,
    getLike,
    getRetweet,
 } from '../utils/util';


interface TweetProps {
    getAllTweets: (wallet: AnchorWallet) => void,
    walletPubkey: PublicKey,
    profilePubkey: PublicKey,
    tweetPubkey: PublicKey,
    displayName: string,
    handle: string,
    message: string,
    likeCount: number,
    retweetCount: number,
    tweetLiked: boolean,
    tweetRetweeted: boolean,
};

export const Tweet: FC<TweetProps> = (props: TweetProps) => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const [tweetRetweeted, setTweetRetweeted] = useState<boolean>(props.tweetRetweeted);
    const [tweetLiked, setTweetLiked] = useState<boolean>(props.tweetLiked);


    async function getTweetLiked(wallet: AnchorWallet, tweetPubkey: PublicKey) {
        try {
            const like = await getLike(wallet, tweetPubkey);
            return like ? true : false;
        } catch (_) {
            return false;
        };
    }
    async function getTweetRetweeted(wallet: AnchorWallet, tweetPubkey: PublicKey) {
        try {
            const retweet = await getRetweet(wallet, tweetPubkey);
            return retweet ? true : false;
        } catch (_) {
            return false;
        };
    }

    const onClickRetweetTweet = useCallback(async () => {
        if (!tweetRetweeted) {
            const tx = await createRetweetTransaction(wallet, props.tweetPubkey);
            await connection.confirmTransaction(
                await sendTransaction(tx, connection)
            );
            props.getAllTweets(wallet);
            setTweetRetweeted(
                await getTweetRetweeted(wallet, props.tweetPubkey)
            );
        };
    }, [wallet, props.tweetPubkey, tweetRetweeted, setTweetRetweeted]);

    const onClickLikeTweet = useCallback(async () => {
        if (!tweetLiked) {
            const tx = await createLikeTransaction(wallet, props.tweetPubkey);
            await connection.confirmTransaction(
                await sendTransaction(tx, connection)
            );
            props.getAllTweets(wallet);
            setTweetLiked(
                await getTweetLiked(wallet, props.tweetPubkey)
            );
        };
    }, [tweetLiked, setTweetLiked]);


    return(
        <div className="text-sm border-2 rounded-lg border-[#6e6e6e] px-6 py-2 mt-4 bg-[#1f1f1f]">
            <p>
                <span className="text-[#a3a3a3] text-sm text-clip">
                    {props.walletPubkey.toString().substring(0, 32)}
                </span>
                <span className="text-[#a3a3a3] text-sm">
                    ...
                </span>
            </p>
            <p className="text-lg">
                <span className="text-[#29d688]">
                    {props.displayName}
                </span>
                <span className="ml-10 text-[#74a8fc]">
                    {props.handle}
                </span>
            </p>
            <p className="my-1 text-lg">
                {props.message}
            </p>
            <p className="text-center">
                <span className="text-[#29d688]" onClick={() => onClickRetweetTweet()}>
                    {tweetRetweeted ? <span>⚪</span> : <button>🔁</button>}
                </span>
                <span className="ml-4 text-[#29d688]">
                    {props.retweetCount}
                </span>
                <span className="ml-10 text-[#de6fd8]" onClick={() => onClickLikeTweet()}>
                    {tweetLiked ? <span>🤍</span> : <button>💖</button>}
                </span>
                <span className="ml-4 text-[#de6fd8]">
                    {props.likeCount}
                </span>
            </p>
        </div>
    );
};
