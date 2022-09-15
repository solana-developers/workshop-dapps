import create, { State } from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'
import { EntryMetadataInterface } from 'models/types';
import { EntryMetadata } from '../../../ts/state/entry';

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
    const [journalAddress, _] = await PublicKey.findProgramAddress(
      [ Buffer.from("journal"), walletPubkey.toBuffer() ],
      programId,
  );
    try {
      entries = (await connection.getProgramAccounts(
        programId,
        // {
        //   filters: ?? // TODO
        // }
      )).map((a) => {
        const data = EntryMetadata.fromBuffer(a.account.data);
        if (data.journal === journalAddress) {
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
      console.log(`Entries fetched successfully!`);
    })
  },
}));

export default useEntryStore;