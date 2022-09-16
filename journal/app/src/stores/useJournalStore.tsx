import create, { State } from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'
import { JournalMetadataInterface } from 'models/types';
import { JournalMetadata } from '../idl/state/journal';

interface JournalStore extends State {
  journal: JournalMetadataInterface;
  getJournal: (
    walletPubkey: PublicKey, 
    programId: PublicKey, 
    connection: Connection
    ) => void
}

const useJournalStore = create<JournalStore>((set, _get) => ({
  journal: undefined,
  getJournal: async (walletPubkey, programId, connection) => {
    let journal: JournalMetadataInterface = undefined;
    try {
      const [journalAddress, _] = await PublicKey.findProgramAddress(
        [ Buffer.from("journal"), walletPubkey.toBuffer() ],
        programId,
      );
      const data = JournalMetadata.fromBuffer(
        (await connection.getAccountInfo(journalAddress)).data
      );
      journal = {
        nickname: data.nickname,
        authority: data.authority,
        entries: data.entries,
        bump: data.bump,
      };
      console.log(`Journal fetched successfully!`);
    } catch (e) {
      console.log(`Error fetching journal: `, e);
    }
    set((s) => {
      s.journal = journal;
    })
  },
}));

export default useJournalStore;