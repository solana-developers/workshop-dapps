import { FC, useEffect } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import useStoreEmojiStore from 'stores/useStoreEmojiStore';
import { StoreOrder } from './StoreOrder';


interface StoreProps {
    getUserMetadata: (wallet: AnchorWallet | undefined) => void,
    getAllUserEmojis: (wallet: AnchorWallet | undefined) => void,
    wallet: AnchorWallet,
}

export const Store: FC<StoreProps> = (props: StoreProps) => {

    const { storeEmojis, getAllStoreEmojis } = useStoreEmojiStore();

    useEffect(() => {
        getAllStoreEmojis(props.wallet);
    }, []);

    useEffect(() => {
        setInterval(() => getAllStoreEmojis(props.wallet), 10000);
    }, [props.wallet, getAllStoreEmojis]);

    return(
        <div className="ml-2 p-6 border-2 rounded-lg border-[#6e6e6e]">
            <span className="mb-2 text-left text-2xl">Store emojis:</span>
            <div className="mt-4">
                <span className="ml-12">Qty</span>
                <span className="ml-6">Price</span>
            </div>
            <div className="mt-2">
                {storeEmojis.map((s, i) => { 
                    return <StoreOrder 
                        key={i} 
                        getAllStoreEmojis={getAllStoreEmojis} 
                        getUserMetadata={props.getUserMetadata}
                        getAllUserEmojis={props.getAllUserEmojis}
                        emojiName={s.emojiName} 
                        display={s.display} 
                        price={s.price} 
                        balance={s.balance} 
                    />
                })}
            </div>
        </div>
    )
};