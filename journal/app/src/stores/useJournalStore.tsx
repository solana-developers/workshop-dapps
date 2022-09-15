import create, { State } from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'
import { JournalMetadataInterface } from 'models/types';
import { JournalMetadata } from '../../../ts/state/journal';

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
    const [journalAddress, _] = await PublicKey.findProgramAddress(
      [ Buffer.from("journal"), walletPubkey.toBuffer() ],
      programId,
  );
    try {
      const data = JournalMetadata.fromBuffer(
        (await connection.getAccountInfo(journalAddress)).data
      );
      return {
        nickname: data.nickname,
        authority: data.authority,
        entries: data.entries,
        bump: data.bump,
      }
    } catch (e) {
      console.log(`Error fetching journal: `, e);
    }
    set((s) => {
      s.journal = journal;
      console.log(`Journal fetched successfully!`);
    })
  },
}));

export default useJournalStore;