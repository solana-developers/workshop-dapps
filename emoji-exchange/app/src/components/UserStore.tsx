import { FC, useEffect } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import useUserEmojiStore from 'stores/useUserEmojiStore';
import { UserOrder } from './UserOrder';


interface UserStoreProps {
    getUserMetadata: (wallet: AnchorWallet | undefined) => void,
    wallet: AnchorWallet,
    username: string,
}

export const UserStore: FC<UserStoreProps> = (props: UserStoreProps) => {

    const { userEmojis, getAllUserEmojis } = useUserEmojiStore();

    useEffect(() => {
        getAllUserEmojis(props.wallet);
    }, [props.wallet, getAllUserEmojis]);

    return(
        <div className="ml-2 p-6 border-2 rounded-lg border-[#6e6e6e]">
            <span className="mb-2 text-left text-2xl">
                Emojis owned by <span className="text-[#00d466]">{props.username}</span>:
            </span>
            <div className="mt-4">
                <span className="ml-12">Qty</span>
                <span className="ml-6">Cost Avg</span>
            </div>
            <div className="mt-2">
                {userEmojis.map((u, i) => { 
                if (u.balance > 0) {
                    return <UserOrder 
                        key={i} 
                        getAllUserEmojis={getAllUserEmojis} 
                        getUserMetadata={props.getUserMetadata}
                        emojiName={u.emojiName} 
                        display={u.display} 
                        balance={u.balance} 
                        costAverage={u.costAverage} 
                    />
                };
                })}
            </div>
        </div>
    )
};