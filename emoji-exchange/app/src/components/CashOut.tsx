import { FC, useCallback, useEffect, useState } from 'react';
import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import * as util from '../utils/util';
import { DEFAULT_USER_STARTING_EBUCKS_BALANCE, MIN_PROFIT_FOR_CASHOUT } from '../utils/const';
import { UserMetadataObject } from 'models/types';


interface CashOutProps {
    userMetadata: UserMetadataObject,
    getUserMetadata: (wallet: AnchorWallet | undefined) => void,
}

export const CashOut: FC<CashOutProps> = (props: CashOutProps) => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const [ recipientPubkey, setRecipientPubkey ] = useState<anchor.web3.PublicKey>();
    const [ exportEligible, setExportEligible ] = useState<boolean>(false);


    const onClickCashOut = useCallback(async () => {
        const tx = await util.cashOutUser(wallet, recipientPubkey);
        const sx = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sx);
        props.getUserMetadata(wallet);
    }, [wallet, props.getUserMetadata]);


    useEffect(() => {
        if (props.userMetadata) {
            console.log(`Trade Count: ${props.userMetadata.tradeCount}`);
            let eBucksProfit = props.userMetadata.ebucksBalance - DEFAULT_USER_STARTING_EBUCKS_BALANCE;
            if (eBucksProfit <= MIN_PROFIT_FOR_CASHOUT) {
                setExportEligible(true);
            } else {
                setExportEligible(false);
            }
        } else {
          props.getUserMetadata(wallet);
        };
      }, [wallet, props.userMetadata, props.getUserMetadata]);


    return(
        <div>
            <div className="text-center">
                <div className="mx-auto mb-4 p-2 w-64 text-center border-2 rounded-lg border-[#6e6e6e]">
                    <div>
                        <span className="text-[#f0f00a]">eBucks Balance: </span>
                        <span>{props.userMetadata.ebucksBalance || 0}</span>
                        </div>
                        <div>
                        <span className="text-[#f0f00a]">eBucks Profit: </span>
                        <span>{props.userMetadata.ebucksBalance - DEFAULT_USER_STARTING_EBUCKS_BALANCE || 0}</span>
                    </div>
                </div>
            </div>
            {(exportEligible && !props.userMetadata.cashedOut) &&
                <div className="mx-auto mb-4 p-6 text-center">
                    <p>Congratulations!</p>
                    <p>You can now cash out your SOL balance!</p>
                    <p><span className="font-bold text-[#d4005c]">Warning:</span> You can only do this once.</p>
                    {/* <input 
                        type="text" 
                        className="input input-bordered w-60 m-2" 
                        placeholder="Enter PublicKey to cash out to:"
                        onChange={(e) => setRecipientPubkey(new anchor.web3.PublicKey(e.target.value))}
                    /> */}
                    <button
                        className="px-8 m-2 w-40 btn animate-pulse bg-[#d4005c] hover:from-pink-500 hover:to-yellow-500 ..."
                        onClick={() => onClickCashOut()}>
                        <span>Cash Out</span>
                    </button>
                </div>
            }
        </div>
    )
};