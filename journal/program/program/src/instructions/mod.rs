use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    entrypoint::ProgramResult, 
    program_error::ProgramError,
};

pub mod init_journal;
pub mod new_entry;

pub use init_journal::*;
pub use new_entry::*;


#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct JournalInstruction {
    pub ixd: JournalInstructionType,
    pub body: String,
    pub bump: u8,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum JournalInstructionType {
    InitJournal {
        pub ixd: JournalInstructionType,
        pub nickname: String,
        pub bump: u8,
    },
    NewEntry {
        pub ixd: JournalInstructionType,
        pub message: String,
        pub bump: u8,
    },
}

impl JournalInstruction {
    pub fn unpack(input: &[u8]) -> <JournalInstructionType, ProgramResult> {
        match JournalInstruction::try_from_slice(&input) {
            Ok(ix) => Ok(
                match ix.ixd {
                    JournalInstructionType::InitJournal => InitJournal {
                        nickname: body,
                        bump,
                    },
                    JournalInstructionType::NewEntry => NewEntry {
                        message: body,
                        bump,
                    },
                }
            ),
            Err(_) => Err(ProgramError::InvalidInstructionData),
        }
    }
}
