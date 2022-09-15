use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::AccountInfo, 
    entrypoint::ProgramResult, 
    pubkey::Pubkey,
};
use crate::instructions::*;


#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum JournalInstruction {
    InitJournalInstruction(InitJournalArgs),
    NewEntryInstruction(NewEntryArgs),
}


pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {

    let instruction = JournalInstruction::try_from_slice(&input)?;
    match instruction {
        JournalInstruction::InitJournalInstruction(
            args) => init_journal(program_id, accounts, args),
        JournalInstruction::NewEntryInstruction(
            args) => new_entry(program_id, accounts, args),
    }
}