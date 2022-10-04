import { FC, useCallback, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getRandomNumberData, SvgData } from '../utils/util';
import SVG from 'react-inlinesvg';
import WorkshopLinks from './WorkshopLinks';


export const SvgGenerator: FC = () => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [ showUrlQrCodes, setShowUrlQrCodes ] = useState<boolean>(false);

    const [ 
        programIdString, 
        setProgramIdString 
    ] = useState<string>("");

    const [ 
        svgString, 
        setSvgString 
    ] = useState<string>("");


    const onClickGenerateSvg = useCallback(async () => {

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
        <div className='flex flex-col w-full'>
            { showUrlQrCodes ? 
                <div>
                    <button className="text-md text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 ml-4 bg-[#58a5bf]" 
                        onClick={() => setShowUrlQrCodes(false)}>
                            <span>Hide URL QR Codes</span>
                    </button>
                    <WorkshopLinks/>
                </div>
                :
                <div>
                    <button className="text-md text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 ml-4 bg-[#58a5bf]" 
                        onClick={() => setShowUrlQrCodes(true)}>
                            <span>Show URL QR Codes</span>
                    </button>
                </div>
            }
            <div className='rounded-md border-2 border-[#2b2b2b] px-8 py-4 mt-4'>
                { publicKey ?
                    <div className='flex flex-row p-0'>
                        <div className='my-auto ml-auto mr-4'>
                            <div className='mt-4 text-xl'>
                                <p>Enter your program's ID:</p>
                            </div>
                            <div className='mt-4 text-lg'>
                                <input className="w-72 h-12 text-black px-4 rounded-md" 
                                    type="text" 
                                    id="programIdString"
                                    placeholder="Program ID..." 
                                    onChange={e => setProgramIdString(e.target.value)}
                                    value={programIdString}
                                />
                            </div>
                            <div className='mt-4 text-2xl'>
                                <button className="text-lg text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 ml-4 bg-[#83eb34]" 
                                    onClick={() => onClickGenerateSvg()}>
                                        <span>Generate!</span>
                                </button>
                            </div>
                        </div>
                        <div className='my-auto ml-4 mr-auto'>
                            { svgString != "" && 
                                <div>
                                    <SVG src={svgString} />
                                </div>
                            }
                        </div>
                    </div>
                :
                <div>
                    <div className='mt-4 text-xl'>
                        <p>Connect your wallet!</p>
                    </div>
                </div>
                }
            </div>
        </div>
    );
};