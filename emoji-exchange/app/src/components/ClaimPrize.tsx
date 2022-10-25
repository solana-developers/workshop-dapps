import { FC, useCallback, useEffect, useState } from 'react';
import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as util from '../utils/util';
import { DEFAULT_USER_STARTING_EBUCKS_BALANCE, MIN_PROFIT_FOR_CASHOUT } from '../utils/const';
import { GameObject, ProfitLeaderObject, UserMetadataObject } from 'models/types';


interface ClaimPrizeProps {
    profitLeaders: ProfitLeaderObject[],
    getAllProfitLeaders: (wallet: AnchorWallet | undefined) => void,
    userMetadata: UserMetadataObject,
    getUserMetadata: (wallet: AnchorWallet | undefined) => void,
    game: GameObject,
    getGame: (wallet: AnchorWallet | undefined) => void,
}

export const ClaimPrize: FC<ClaimPrizeProps> = (props: ClaimPrizeProps) => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const [ prizeEligible, setPrizeEligible ] = useState<boolean>(false);


    const onClickClaimPrize = useCallback(async () => {
        const tx = await util.claimPrize(wallet);
        const sx = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sx);
        props.getUserMetadata(wallet);
        props.getGame(wallet);
    }, [wallet, props.getUserMetadata]);


    useEffect(() => {
        if (props.userMetadata && props.profitLeaders && props.profitLeaders[0]) {
            const eBucksProfit = props.userMetadata.ebucksBalance - DEFAULT_USER_STARTING_EBUCKS_BALANCE;
            const isInProfitRange: boolean = eBucksProfit >= MIN_PROFIT_FOR_CASHOUT;
            const isTopProfitLeader: boolean = props.profitLeaders[0].authority.toString() === wallet.publicKey.toString();
            if (isInProfitRange && isTopProfitLeader) {
                setPrizeEligible(true);
            } else {
                setPrizeEligible(false);
            }
        } else {
          props.getUserMetadata(wallet);
          props.getAllProfitLeaders(wallet);
        };
      }, [
        wallet, 
        props.userMetadata, 
        props.getUserMetadata,
        props.profitLeaders,
        props.getAllProfitLeaders,
    ]);


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
            {prizeEligible  &&
                <div className="mx-auto mb-4 p-6 text-center">
                    <p>Congratulations!</p>
                    <p>You can now claim the game's prize!</p>
                    <p> <span className='text-[#00d466]'>Prize:</span> {(props.game.prize * 0.000001).toString()} USDC</p>
                    <p><span className="font-bold text-[#d4005c]">Warning:</span> You can only do this once.</p>
                    <button
                        className="px-8 m-2 w-40 btn animate-pulse bg-[#d4005c] hover:from-pink-500 hover:to-yellow-500 ..."
                        onClick={() => onClickClaimPrize()}>
                        <span>Cash Out</span>
                    </button>
                </div>
            }
        </div>
    )
};