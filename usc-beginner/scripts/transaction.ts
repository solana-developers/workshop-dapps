import { 
    Connection, 
    Keypair, 
    TransactionInstruction, 
    TransactionMessage, 
    VersionedTransaction 
} from "@solana/web3.js"


export async function buildTransaction(
    connection: Connection,
    payer: Keypair,
    instructions: TransactionInstruction[]
): Promise<VersionedTransaction> {

    let blockhash = await connection
        .getLatestBlockhash()
        .then((res) => res.blockhash)
    
    const messageV0 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message()
    
    const tx = new VersionedTransaction(messageV0)
    
    tx.sign([payer])

    return tx
}