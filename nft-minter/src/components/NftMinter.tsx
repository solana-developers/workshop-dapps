import { FC, useCallback, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
    bundlrStorage,
    Metaplex,
    walletAdapterIdentity,
} from "@metaplex-foundation/js";
import assert from 'assert';
import { Keypair } from '@solana/web3.js';


export const NftMinter: FC = () => {

    const { connection } = useConnection();
    const { publicKey, wallet, sendTransaction } = useWallet();

    const [ title, setTitle ] = useState<string>("");
    const [ symbol, setSymbol ] = useState<string>("");
    const [ description, setDescription ] = useState<string>("");
    const [ imageUrl, setImageUrl ] = useState<string>("");

    const [ nftAddress, setNftAddress ] = useState<string>("");

    const onClickMintNft = useCallback(async () => {

        assert(publicKey, "Wallet not connected")
        assert(wallet, "Wallet not connected")
        assert(title, "Name not provided")
        assert(symbol, "Symbol not provided")
        assert(description, "Symbol not provided")
        assert(imageUrl, "Image URL not provided")

        const metaplex = Metaplex.make(connection)
            .use(walletAdapterIdentity(wallet.adapter))
            .use(bundlrStorage({ address: "https://devnet.bundlr.network" }));
        
        const { uri } = await metaplex.nfts().uploadMetadata({
            title,
            symbol,
            description,
            imageUrl,
        })

        setNftAddress((await metaplex.nfts().create({
            name: title,
            uri,
            sellerFeeBasisPoints: 0,
            useNewMint: Keypair.generate(),
            tokenOwner: publicKey,
        })).mintAddress.toBase58())

    }, [publicKey, wallet, title, symbol, description, imageUrl]);


    return(
        <div className='flex flex-col w-full'>
            <div className='rounded-md border-2 border-[#2b2b2b] px-8 py-4 mt-4'>
                { publicKey ?
                    <div className='flex flex-row p-0'>
                        <div className='my-auto ml-auto mr-4'>
                            <div className='mt-4 mb-2 text-xl'>
                                <p>Enter your NFT's metadata:</p>
                            </div>
                            <div className='text-lg flex flex-col text-center'>
                                <input className="m-4 w-72 h-12 text-black px-4 rounded-md" 
                                    type="text" 
                                    id="Title"
                                    placeholder="Title" 
                                    onChange={e => setTitle(e.target.value)}
                                    value={title}
                                />
                                <input className="m-4 w-72 h-12 text-black px-4 rounded-md" 
                                    type="text" 
                                    id="Symbol"
                                    placeholder="Symbol" 
                                    onChange={e => setSymbol(e.target.value)}
                                    value={symbol}
                                />
                                <input className="m-4 w-72 h-12 text-black px-4 rounded-md" 
                                    type="text" 
                                    id="Description"
                                    placeholder="Description" 
                                    onChange={e => setDescription(e.target.value)}
                                    value={description}
                                />
                                 <input className="m-4 w-72 h-12 text-black px-4 rounded-md" 
                                    type="text" 
                                    id="ImageUrl"
                                    placeholder="Image Url" 
                                    onChange={e => setImageUrl(e.target.value)}
                                    value={imageUrl}
                                />
                            </div>
                            <div className='mt-4 text-2xl'>
                                <button className="text-lg text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 ml-4 bg-[#83eb34]" 
                                    onClick={() => onClickMintNft()}>
                                        <span>Create!</span>
                                </button>
                            </div>
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