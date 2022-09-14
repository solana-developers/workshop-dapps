use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::instructions::{init_journal, new_entry, JournalInstruction};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    match JournalInstruction::try_from_slice(&instruction_data)? {
        JournalInstruction::InitJournal(args) => init_journal(program_id, accounts, args),
        JournalInstruction::NewEntry(args) => new_entry(program_id, accounts, args),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}
