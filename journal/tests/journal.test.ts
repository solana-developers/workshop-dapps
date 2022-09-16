import {
    Connection,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import {
    createInitializeJournalInstruction,
    createKeypairFromFile,
    createNewEntryInstruction,
    EntryMetadata,
    JournalMetadata,
} from '../app/src/idl';


describe("Journal dApp!", async () => {

    const connection = new Connection(`http://localhost:8899`, 'confirmed');
    const payer = createKeypairFromFile(require('os').homedir() + '/.config/solana/id.json');
    const program = createKeypairFromFile('./target/deploy/journal-keypair.json');

    it("Initialize the Journal", async () => {
        const [ix, journalAddress] = await createInitializeJournalInstruction(
            payer.publicKey, 
            program.publicKey,
            "Joe's Journal",
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
        await printJournal(journalAddress);
    });

    async function writeNewEntry(message: string): Promise<void> {
        const [ix, entryAddress] = await createNewEntryInstruction(
            connection, 
            payer.publicKey, 
            program.publicKey,
            message
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
        await printEntryMetadata(entryAddress);
    }
    
    it("Write a new entry (1/3)", async () => {
        await writeNewEntry("Just got back from the Solana Hacker House");
    });

    it("Write a new entry (2/3)", async () => {
        await writeNewEntry("Just built my first Solana program");
    });
    
    it("Write a new entry (3/3)", async () => {
        await writeNewEntry("I got a job at a Solana protocol!");
    });

    async function printJournal(pubkey: PublicKey): Promise<void> {
        const journalData = JournalMetadata.fromBuffer(
            (await connection.getAccountInfo(pubkey)).data
        );
        console.log("Journal:");
        console.log(`${pubkey}`);
        console.log(`   Nickname:       ${journalData.nickname}`);
    }

    async function printEntryMetadata(pubkey: PublicKey): Promise<void> {
        const EntryMetadataData = EntryMetadata.fromBuffer(
            (await connection.getAccountInfo(pubkey)).data
        );
        console.log("Journal Entry:");
        console.log(`${pubkey}`);
        console.log(`   Entry #:       ${EntryMetadataData.entry_number}`);
        console.log(`   Message:       ${EntryMetadataData.message}`);
    }
  });
  