import { 
    Connection, 
    Keypair, 
    SystemProgram, 
    Transaction, 
    TransactionInstruction 
} from '@solana/web3.js';
import { getRandomNumberData, SvgData } from '../app/src/utils/util';


const connection = new Connection(
    "https://api.devnet.solana.com",
    // "http://localhost:8899",
    "confirmed",
);
const payer = createKeypairFromFile(
    require('os').homedir() + '/.config/solana/id.json'
);
const program = createKeypairFromFile(
    './target/deploy/svg_generator-keypair.json'
);


describe("SVG Generator!", async () => {
    
    it("Generates an SVG!", async () => {

        const svgAccount = Keypair.generate();
        console.log(`New account for SVG: ${svgAccount.publicKey}`);
        await createSvg(svgAccount);
        await delay(1);
        await printSvg(svgAccount);
    });
});

async function createSvg(svgAccount: Keypair): Promise<void> {
    const ix = new TransactionInstruction({
        programId: program.publicKey,
        keys: [
            {pubkey: svgAccount.publicKey, isSigner: true, isWritable: true},
            {pubkey: payer.publicKey, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
        ],
        data: getRandomNumberData(),
    });
    await connection.sendTransaction(
        new Transaction().add(ix),
        [payer, svgAccount],
    );
}

async function printSvg(svgAccount: Keypair): Promise<void> {
    const accountInfo = await connection.getAccountInfo(
        svgAccount.publicKey,
    );
    if (accountInfo) console.log(SvgData.fromBuffer(accountInfo.data));
}

function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
    )
};

function delay(s: number) {
    return new Promise( resolve => setTimeout(resolve, s * 1000) );
}