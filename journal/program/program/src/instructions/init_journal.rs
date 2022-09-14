use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
    sysvar::rent::Rent,
    sysvar::Sysvar,
};

use crate::state::JournalMetadata;


// The instruction data struct to create a new journal
//
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct InitJournal {
    pub nickname: String,
    pub bump: u8,
}


// Create a new PDA (the journal)
//
pub fn init_journal(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    init_ix: InitJournal,
) -> ProgramResult {

    msg!("Creating new journal account...");

    let accounts_iter = &mut accounts.iter();
    let journal = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let journal_metadata = JournalMetadata::new(
        init_ix.nickname,
        payer.key.clone(),
        init_ix.bump,
    );
    
    let account_span = (journal_metadata.try_to_vec()?).len();
    let lamports_required = (Rent::get()?).minimum_balance(account_span);

    // Invoke the System Program to create the new account
    //
    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &journal.key,
            lamports_required,
            account_span as u64,
            program_id,
        ),
        &[
            payer.clone(), journal.clone(), system_program.clone()
        ],
        &[&[
            JournalMetadata::SEED_PREFIX.as_bytes().as_ref(),
            payer.key.as_ref(),
            &[journal_metadata.bump],
        ]]
    )?;

    // Set the initial data
    //
    journal_metadata.serialize(
        &mut &mut journal.data.borrow_mut()[..]
    )?;

    msg!("Success!");
    msg!("Pubkey: {}", &journal.key);
    Ok(())
}
