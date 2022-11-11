import {
    Metaplex,
    keypairIdentity, 
    bundlrStorage
} from "@metaplex-foundation/js"
import { 
    Connection, 
    Keypair, 
    LAMPORTS_PER_SOL, 
} from "@solana/web3.js"
import {
    logTransaction,
    logBalance,
    logConnection, 
    logNewKeypair,
    logNewMint,
} from './log'


async function main() {

    const connection = new Connection(
        "https://api.devnet.solana.com", 
        'confirmed'
    )
    await logConnection(connection)


    const payer = Keypair.generate()
    logNewKeypair(payer)

    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL)
    await logTransaction(connection, airdropSignature)

    console.log("Fee Payer:")
    await logBalance(connection, payer.publicKey)

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(payer))
        .use(bundlrStorage({ address: "https://devnet.bundlr.network" }));
    
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: "USC Blockhain NFT",
        symbol: "USC",
        description: "NFT minted in the Solana Beginner Workshop!",
        image: "https://irp.cdn-website.com/0d216ddc/dms3rep/multi/bclogo.svg",
    })

    const { nft } = await metaplex.nfts().create({
        name: "USC Blockchain NFT",
        uri: uri,
        sellerFeeBasisPoints: 0,
        tokenOwner: payer.publicKey,
    })
    logNewMint(nft.address)

}

main()