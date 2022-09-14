use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, 
    entrypoint::ProgramResult, 
    program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::instructions::InitJournal;
use crate::instructions::init_journal;
use crate::instructions::NewEntry;
use crate::instructions::new_entry;


pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    
    match InitJournal::try_from_slice(&instruction_data) {
        Ok(init_ix) => return init_journal(
            program_id,
            accounts,
            init_ix,
        ),
        Err(_) => {},
    };

    match NewEntry::try_from_slice(&instruction_data) {
        Ok(new_entry_ix) => return new_entry(
            program_id,
            accounts,
            new_entry_ix,
        ),
        Err(_) => {},
    };

    Err(ProgramError::InvalidInstructionData)
}