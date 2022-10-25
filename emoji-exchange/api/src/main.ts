#!/usr/bin/env node
import Commander from "commander";
import * as dotenv from 'dotenv';
import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { PREFLIGHT_COMMITMENT } from "../../app/src/utils/const";
import { SeedUtil } from "../../app/src/utils/seed-util";
import { initializeGame } from './game-initializer';
import { initializeStore } from './store-initializer';
import { runPriceModifier } from './price-modifier';


const MASTER_WALLET = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(require('fs').readFileSync(
        __dirname + '/../wallet/master.json', "utf-8"
    )))
);


const api: Commander.Command = new Commander.Command("emoji-exchange-api")
    .action(function (reset: boolean, fundSol: boolean, fundUsdc: boolean) {
        reset = reset;
        fundSol = fundSol;
        fundUsdc = fundUsdc;
    })
    .option(
        `-r --reset`, "Close all accounts to reset the game: true | false"
    )
    .option(
        `-s --fund-sol`, "Fund the game's vault with SOL: true | false"
    )
    .option(
        `-u --fund-usdc`, "Fund the game's vault with USDC: true | false"
    )
    .parse(process.argv);


export class AnchorConfigs {
    masterWallet: anchor.web3.Keypair;
    provider: anchor.AnchorProvider;
    program: anchor.Program;
    seedUtil: SeedUtil;

    constructor() {
        this.masterWallet = MASTER_WALLET;
        this.provider = new anchor.AnchorProvider(
            new anchor.web3.Connection(process.env.RPC_ENDPOINT, PREFLIGHT_COMMITMENT), 
            new anchor.Wallet(MASTER_WALLET), 
            { "preflightCommitment": PREFLIGHT_COMMITMENT }
        );
        const idl = require("../../app/src/utils/idl.json");
        this.program = new anchor.Program(idl, idl.metadata.address, this.provider);
        this.seedUtil = new SeedUtil(this.program);
    }

    async init() {
        await this.seedUtil.init();
    }
}


async function main() {

    dotenv.config();
    const options = api.opts();
    const anchorConfigs = new AnchorConfigs();
    await anchorConfigs.init();

    await initializeGame({
        reset: options.reset,
        fundSol: options.fundSol,
        fundUsdc: options.fundUsdc,
    }, anchorConfigs);
    await initializeStore(anchorConfigs);
    await runPriceModifier(anchorConfigs);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);