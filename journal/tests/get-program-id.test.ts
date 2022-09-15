import { createKeypairFromFile } from '../app/src/idl';


describe("Journal dApp!", async () => {

    const payer = createKeypairFromFile(require('os').homedir() + '/.config/solana/id.json');
    const program = createKeypairFromFile('./target/deploy/journal-keypair.json');

    it("Dump Program ID", async () => {
        console.log(`Payer: ${payer.publicKey}`);
        console.log(`Program ID: ${program.publicKey}`);
    });
  });
  