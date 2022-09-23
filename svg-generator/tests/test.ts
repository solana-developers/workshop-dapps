import { 
    Connection, 
    Keypair, 
    Transaction, 
    TransactionInstruction 
} from '@solana/web3.js';
import * as bl from "buffer-layout";


const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed",
);
const payer = createKeypairFromFile(
    require('os').homedir() + '/.config/solana/id.json'
);
const program = createKeypairFromFile(
    './program/target/so/program-keypair.json'
);


describe("SVG Generator!", () => {

    it("Generates an SVG!", () => {

        const ix = new TransactionInstruction({
            programId: program.publicKey,
            keys: [],
            data: getRandomNumberData(),
        });

        const tx = new Transaction().add(ix);

        connection.sendTransaction(
            tx,
            [payer],
        );
    });
});

function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
    )
};

function getRandomNumberData(): Buffer {
    let data = Buffer.alloc(8);
    bl.ns64("random_1").encode(generateRandomNumber(), data);
    bl.ns64("random_2").encode(generateRandomNumber(), data);
    bl.ns64("random_3").encode(generateRandomNumber(), data);
    bl.ns64("random_4").encode(generateRandomNumber(), data);
    return data;
};

function generateRandomNumber(): number {
    const min = 0;
    const max = 4;
    return Math.random() * (max - min) + min;
};