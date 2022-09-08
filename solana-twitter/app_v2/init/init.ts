import * as anchor from "@project-serum/anchor";
import * as constants from '../src/utils/const';
import * as util from '../src/utils/util';


const MASTER_WALLET: anchor.Wallet = new anchor.Wallet(
    anchor.web3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse(
            require('fs').readFileSync(
                __dirname + '/../wallet/master.json', 
                "utf-8"
)))));
const connection: anchor.web3.Connection = new anchor.web3.Connection(
    constants.NETWORK, 
    constants.PREFLIGHT_COMMITMENT
);


async function main() {

    console.log("Creating a new mint for likes and retweets...");
    try {
        await anchor.web3.sendAndConfirmTransaction(
            connection,
            (await util.createMints(MASTER_WALLET))[0],
            [MASTER_WALLET.payer]
        );
    } catch (_) {};
    console.log("Success.");
}


main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);