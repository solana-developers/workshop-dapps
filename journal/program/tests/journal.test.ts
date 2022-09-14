import {
    Connection,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import {
    createInitializeJournalInstruction,
    createKeypairFromFile,
    createNewEntryInstruction,
} from '../ts';


describe("Journal dApp!", async () => {

    const connection = new Connection(`http://localhost:8899`, 'confirmed');
    const payer = createKeypairFromFile(require('os').homedir() + '/.config/solana/id.json');
    const program = createKeypairFromFile('./program/target/so/journal-keypair.json');

    it("Initialize the Journal", async () => {
        const [ix, journalAddress] = createInitializeJournalInstruction(
            payer.publicKey, program.publicKey
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
    });
    
    it("Write a new entry (1/3)", async () => {
        const message = "Just got back from the Solana Hacker House";
        const [ix, entryAddress] = await createNewEntryInstruction(
            connection, payer.publicKey, program.publicKey, message
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
    });
    it("Write a new entry (2/3)", async () => {
        const message = "Just built my first Solana program";
        const [ix, entryAddress] = await createNewEntryInstruction(
            connection, payer.publicKey, program.publicKey, message
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
    });
    it("Write a new entry (3/3)", async () => {
        const message = "I got a job at a Solana protocol!";
        const [ix, entryAddress] = await createNewEntryInstruction(
            connection, payer.publicKey, program.publicKey, message
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
    });
  });
  