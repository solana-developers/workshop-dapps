use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint,
    entrypoint::ProgramResult, 
    program::invoke,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::constants::{
    svg_string_one,
    colors,
    first_words,
    second_words,
    third_words,
    svg_string_two,
};

mod constants;


entrypoint!(svg_generator);


fn svg_generator(
    program_id: &Pubkey, 
    accounts: &[AccountInfo], 
    instruction_data: &[u8],
) -> ProgramResult {

    // Deserialize the random numbers from the instruction data
    let random_numbers = RandomNumbers::try_from_slice(&instruction_data)?;

    // Load the accounts
    let accounts_iter = &mut accounts.iter();
    let svg_account = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;

    // Indexing of said arrays using rand numbers
    let color = colors.get(random_numbers.random_1 as usize).expect("Index out of range.");
    let first_word = first_words.get(random_numbers.random_2 as usize).expect("Index out of range.");
    let second_word = second_words.get(random_numbers.random_3 as usize).expect("Index out of range.");
    let third_word = third_words.get(random_numbers.random_4 as usize).expect("Index out of range.");

    // Generation of svg
    let final_svg_string = String::from(svg_string_one) + color + svg_string_two + first_word + second_word + third_word + "</text></svg>";
    let svg_data = SvgData { 
        image: final_svg_string, 
    };

    // Determine the size of the account
    let account_span = (svg_data.try_to_vec()?).len();
    let lamports_required = (Rent::get()?).minimum_balance(account_span);

    // Creation of a new account
    invoke(
        &system_instruction::create_account(
            &payer.key,
            &svg_account.key,
            lamports_required,
            account_span as u64,
            program_id,
        ),
        &[ payer.clone(), svg_account.clone() ],
    )?;

    // Serialize SVG string into new account
    svg_data.serialize(
        &mut &mut svg_account.data.borrow_mut()[..]
    )?;

    Ok(())
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
struct RandomNumbers {
    random_1: u8,
    random_2: u8,
    random_3: u8,
    random_4: u8,
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
struct SvgData {
    image: String,
}