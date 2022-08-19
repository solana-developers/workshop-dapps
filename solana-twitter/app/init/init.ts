import * as anchor from "@project-serum/anchor";
import * as constants from '../src/utils/const';
import * as util from '../src/utils/util';


const MASTER_WALLET: anchor.Wallet = new anchor.Wallet(
    anchor.web3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse(
            require('fs').readFileSync(
                __dirname + '/../app/wallet/master.json', 
                "utf-8"
)))));


async function main() {

    console.log("Creating new mint for likes...");
    var [tx, provider] = await util.createLikeMint(MASTER_WALLET);
    await provider.connection.confirmTransaction(
        (await provider.connection.sendTransaction(tx, [MASTER_WALLET.payer]))
    );
    console.log("Success.");

    console.log("Creating new mint for retweets...");
    var [tx, provider] = await util.createRetweetMint(MASTER_WALLET);
    await provider.connection.confirmTransaction(
        (await provider.connection.sendTransaction(tx, [MASTER_WALLET.payer]))
    );
    console.log("Success.");
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);