import { FC, useCallback, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getRandomNumberData, SvgData } from '../utils/util';
import SVG from 'react-inlinesvg';


export const SvgGenerator: FC = () => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [ 
        programIdString, 
        setProgramIdString 
    ] = useState<string>("");

    const [ 
        svgString, 
        setSvgString 
    ] = useState<string>("");


    const onClickGenerateSvg = useCallback(async () => {

        console.log(`PROGRAM ID: ${programIdString}`);
        const programId = new PublicKey(programIdString);

        const svgAccount = Keypair.generate();
        
        const ix = new TransactionInstruction({
            programId,
            keys: [
                {pubkey: svgAccount.publicKey, isSigner: true, isWritable: true},
                {pubkey: publicKey, isSigner: true, isWritable: true},
                {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
            ],
            data: getRandomNumberData(),
        });

        let tx = new Transaction().add(ix)
        const recentBlockhash = await connection.getLatestBlockhash();
        tx.recentBlockhash = recentBlockhash.blockhash;
        tx.feePayer = publicKey;
        tx.sign(svgAccount);

        const sx = await sendTransaction(tx, connection);
        await connection.confirmTransaction({
            signature: sx,
            blockhash: recentBlockhash.blockhash,
            lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
        });

        const accountInfo = await connection.getAccountInfo(
            svgAccount.publicKey,
        );
        const svg = SvgData.fromBuffer(accountInfo.data).image;

        setSvgString(svg);

    }, [programIdString, setSvgString]);


    return(
        <div>
            { publicKey ?
                <div>
                    <div className='mt-4 text-xl'>
                        <p>Enter your program's ID:</p>
                    </div>
                    <div className='mt-4 text-2xl'>
                        <input className="w-72 h-12 text-black px-4 rounded-md" 
                            type="text" 
                            id="programIdString"
                            placeholder="Program ID..." 
                            onChange={e => setProgramIdString(e.target.value)}
                            value={programIdString}
                        />
                    </div>
                    <div className='mt-4 text-xl'>
                        <p>Press the button below to generate a new SVG image!</p>
                    </div>
                    <div className='mt-4 text-2xl'>
                        <button className="text-lg text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 ml-4 bg-[#68ccca]" 
                            onClick={() => onClickGenerateSvg()}>
                                <span>Generate!</span>
                        </button>
                    </div>
                    { svgString != "" && 
                        <div>
                            <SVG className='mt-4 max-w-xl h-auto' src={svgString} />
                        </div>
                    }
                </div>
            :
            <div>
                <div className='mt-4 text-xl'>
                    <p>Connect your wallet!</p>
                </div>
            </div>
            }
        </div>
    );
};