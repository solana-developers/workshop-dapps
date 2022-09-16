import create, { State } from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'
import { EntryMetadataInterface } from 'models/types';
import { EntryMetadata } from '../idl/state/entry';
import bs58 from 'bs58';

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
              dataSize: 74,
            },
            {
              memcmp: {
                offset: 8,
                bytes: new EntryMetadata({
                  entry_number: 1,
                  message: "",
                  journal: journalAddress,
                  bump: 1,
                }).toBase58(),
              },
            },
          ],
        }
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