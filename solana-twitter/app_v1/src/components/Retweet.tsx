import { FC } from "react";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Tweet } from './Tweet';


interface RetweetProps {
    getAllTweets: (wallet: AnchorWallet) => void,
    retweeterPubkey: PublicKey,
    retweeterHandle: String,
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

export const Retweet: FC<RetweetProps> = (props: RetweetProps) => {
    return(
        <div>
            <p>Retweeted by: {props.retweeterHandle}</p>
            <Tweet 
                getAllTweets={props.getAllTweets}
                walletPubkey={props.walletPubkey} 
                profilePubkey={props.profilePubkey} 
                tweetPubkey={props.tweetPubkey} 
                displayName={props.displayName} 
                handle={props.handle} 
                message={props.message}
                likeCount={props.likeCount}
                retweetCount={props.retweetCount}
                tweetLiked={props.tweetLiked}
                tweetRetweeted={props.tweetRetweeted}
            />
        </div>
    );
}