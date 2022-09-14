use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, 
    entrypoint::ProgramResult, 
    program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::instructions::JournalInstruction;
use crate::instructions::JournalInstructionType;


pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    match JournalInstruction::unpack(&instruction_data) {
        JournalInstructionType::InitJournal(obj) => init_journal(
            program_id,
            accounts,
            obj,
        ),
        JournalInstructionType::NewEntry(obj) => new_entry(
            program_id,
            accounts,
            obj,
        ),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}