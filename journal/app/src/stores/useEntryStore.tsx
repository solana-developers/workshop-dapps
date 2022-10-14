import create, { State } from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'
import { EntryMetadataInterface } from 'models/types';
import { EntryMetadata } from '../idl/state/entry';
import { JournalMetadata } from 'idl/state/journal';

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
      const [journalAddress, _journalBump] = await PublicKey.findProgramAddress(
        [ Buffer.from("journal"), walletPubkey.toBuffer() ],
        programId,
      );
      const journalData = JournalMetadata.fromBuffer(
        (await connection.getAccountInfo(journalAddress)).data
      );
      const entryCount = journalData.entries;
      for (var x = 1; x <= entryCount; x++) {
        const [entryAddress, _entryBump] = await PublicKey.findProgramAddress(
            [
                Buffer.from("entry"),
                Buffer.from((x).toString()),
                journalAddress.toBuffer(),
            ],
            programId
        );
        const entryData = EntryMetadata.fromBuffer(
          (await connection.getAccountInfo(entryAddress)).data
        );
        entries.push({
          entryNumber: entryData.entry_number,
          message: entryData.message,
          journal: entryData.journal,
          bump: entryData.bump,
        });
      };
      console.log(`${entries.length} entries fetched successfully!`);
    } catch (e) {
      console.log(`Error fetching journal entries: `, e);
    }
    set((s) => {
      s.entries = entries;
    })
  },
}));

export default useEntryStore;