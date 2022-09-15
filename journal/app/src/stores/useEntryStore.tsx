import create, { State } from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'
import { EntryMetadataInterface } from 'models/types';
import { EntryMetadata } from '../idl/state/entry';

interface EntryStore extends State {
  entries: EntryMetadataInterface[];
  getEntries: (
    walletPubkey: PublicKey, 
    programId: PublicKey, 
    connection: Connection
    ) => void
}

const useEntryStore = create<EntryStore>((set, _get) => ({
  entries: [],
  getEntries: async (walletPubkey, programId, connection) => {
    let entries: EntryMetadataInterface[] = [];
    try {
      const [journalAddress, _] = await PublicKey.findProgramAddress(
        [ Buffer.from("journal"), walletPubkey.toBuffer() ],
        programId,
      );
      entries = (await connection.getProgramAccounts(
        programId,
        {
          filters: [
            {
              dataSize: new EntryMetadata({
                entry_number: 1,
                message: "",
                journal: journalAddress,
                bump: 1,
              }).toBuffer().length,
            },
            // {
            // memcmp: {
            //   bytes: J,
            // },
            // }
          ],
        }
      )).map((a) => {
        const data = EntryMetadata.fromBuffer(a.account.data);
        if (data.journal === journalAddress) {
          console.log(`Entries fetched successfully!`);
          return {
            entryNumber: data.entry_number,
            message: data.message,
            journal: data.journal,
            bump: data.bump,
          }
        }
      });
    } catch (e) {
      console.log(`Error fetching journal entries: `, e);
    }
    set((s) => {
      s.entries = entries;
    })
  },
}));

export default useEntryStore;