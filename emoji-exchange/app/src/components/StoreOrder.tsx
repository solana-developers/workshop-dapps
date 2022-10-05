import { FC, useCallback, useState } from 'react';
import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { OrderType } from '../models/types';
import * as util from '../utils/util';


interface StoreOrderProps {
  getAllStoreEmojis: (wallet: AnchorWallet | undefined) => void,
  getAllUserEmojis: (wallet: AnchorWallet | undefined) => void,
  getUserMetadata: (wallet: AnchorWallet | undefined) => void,
  emojiName: string,
  display: string,
  balance: number,
  price: number,
}

export const StoreOrder: FC<StoreOrderProps> = (props: StoreOrderProps) => {
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();

  const [quantity, setQuantity] = useState<number>(0);

  const onClickOrder = useCallback(async () => {
    const tx = await util.placeOrder(
      wallet,
      props.emojiName,
      OrderType.BUY,
      quantity,
    );
    const sx = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sx);
    props.getAllStoreEmojis(wallet);
    props.getAllUserEmojis(wallet);
    props.getUserMetadata(wallet);
    setQuantity(0);
  }, [quantity, wallet]);

  return (
    <div className='w-full flex flex-row my-2'>
      <span className="text-2xl m-auto">{props.display}</span>

      <span className="text-l m-auto ml-6">{props.balance}</span>

      <span className="text-l m-auto ml-6">{`${props.price} eBucks`}</span>

      <input 
        type="number" 
        className="input input-bordered w-20 my-auto ml-4 mr-2" 
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(+e.target.value as number)}
      />
      
      <button
        className="btn animate-pulse bg-[#00d466] px-8 my-auto m-2 w-20"
        onClick={() => onClickOrder()}>
          <span>Buy</span>
      </button>
    </div>
  )
}