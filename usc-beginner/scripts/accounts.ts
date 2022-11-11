import { 
    Connection, 
    Keypair, 
    LAMPORTS_PER_SOL, 
    SystemProgram, 
} from "@solana/web3.js"
import {
    logTransaction,
    logBalance,
    logConnection, 
    logNewKeypair,
} from './log'
import {
    buildTransaction
} from './transaction'


async function main() {

    const connection = new Connection(
        "https://api.devnet.solana.com", 
        'confirmed'
    )
    await logConnection(connection)


    const keypairA = Keypair.generate()
    logNewKeypair(keypairA)

    const airdropSignature = await connection.requestAirdrop(keypairA.publicKey, 2 * LAMPORTS_PER_SOL)
    await logTransaction(connection, airdropSignature)

    console.log("Account A:");
    await logBalance(connection, keypairA.publicKey)


    const keypairB = Keypair.generate()
    logNewKeypair(keypairB)

    const transferInstruction = SystemProgram.transfer({
        fromPubkey: keypairA.publicKey,
        toPubkey: keypairB.publicKey,
        lamports: 1 * LAMPORTS_PER_SOL,
    })
    const transferTransaction = await buildTransaction(
        connection, 
        keypairA, 
        [transferInstruction]
    )
    const transferSignature = await connection.sendTransaction(transferTransaction)
    await logTransaction(connection, transferSignature)

    console.log("Account A:");
    await logBalance(connection, keypairA.publicKey)
    console.log("Account B:");
    await logBalance(connection, keypairB.publicKey)
}

main()