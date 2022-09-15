use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::rent::Rent,
    sysvar::Sysvar,
};
use crate::state::EntryMetadata;
use crate::state::JournalMetadata;


// Args to create a new entry
//
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NewEntryArgs {
    pub message: String,
    pub bump: u8,
}


// Create a new PDA for the entry
//  & increment the number of entries for the journal
//
pub fn new_entry(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: NewEntryArgs,
) -> ProgramResult {

    msg!("Creating new entry account...");

    let accounts_iter = &mut accounts.iter();
    let entry = next_account_info(accounts_iter)?;
    let journal = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // We'll only create this new entry if the signer is the owner of the journal.
    //
    let journal_account_data = &mut JournalMetadata::try_from_slice(
        &journal.data.borrow()
    )?;
    if &journal_account_data.authority != payer.key {
        return Err(ProgramError::MissingRequiredSignature)
    };

    let entry_number = journal_account_data.entries + 1;
    let entry_metadata = EntryMetadata::new(
        entry_number,
        args.message,
        journal.key.clone(),
        args.bump,
    );

    let account_span = (entry_metadata.try_to_vec()?).len();
    let lamports_required = (Rent::get()?).minimum_balance(account_span);

    // Invoke the System Program to create the new account
    //
    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &entry.key,
            lamports_required,
            account_span as u64,
            program_id,
        ),
        &[
            payer.clone(), entry.clone(), system_program.clone()
        ],
        &[&[
            EntryMetadata::SEED_PREFIX.as_bytes().as_ref(),
            entry_number.to_string().as_ref(),
            journal.key.as_ref(),
            &[entry_metadata.bump],
        ]]
    )?;

    // Set the data
    //
    entry_metadata.serialize(
        &mut &mut entry.data.borrow_mut()[..]
    )?;

    // Now increment the number of entries in the journal
    //
    journal_account_data.increment();
    journal_account_data.serialize(
        &mut &mut journal.data.borrow_mut()[..]
    )?;

    msg!("Success!");
    msg!("Pubkey: {}", &entry.key);
    Ok(())
}
