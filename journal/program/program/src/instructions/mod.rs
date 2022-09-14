use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{entrypoint::ProgramResult, program_error::ProgramError};

pub mod init_journal;
pub mod new_entry;

pub use init_journal::*;
pub use new_entry::*;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum JournalInstruction {
    InitJournal(InitJournalArgs),
    NewEntry(NewEntryArgs),
}
