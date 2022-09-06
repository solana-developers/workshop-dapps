import { PublicKey } from "@solana/web3.js";


export const walletNullErr = () => { 
    throw("Wallet not connected");
};
export const profileNotFoundErr = (pubkey: PublicKey) => { 
    throw(`Profile not found for address ${pubkey}`);
};
export const allProfilesErr = () => { 
    throw("Failed to fetch all profiles");
};
export const tweetNotFoundErr = (pubkey: PublicKey) => { 
    throw(`Profile not found for address ${pubkey}`);
};
export const allTweetsErr = () => { 
    throw("Failed to fetch all tweets");
};
export const likeNotFoundErr = (pubkey: PublicKey) => { 
    throw(`Like not found for address ${pubkey}`);
};
export const allLikesErr = (tweetPubkey: PublicKey) => { 
    throw(`Failed to fetch all likes for tweet address ${tweetPubkey}`);
};
export const retweetNotFoundErr = (pubkey: PublicKey) => { 
    throw(`Retweet not found for address ${pubkey}`); 
};
export const allRetweetsErr = (tweetPubkey: PublicKey) => { 
    throw(`Failed to fetch all retweets for tweet address ${tweetPubkey}`);
};