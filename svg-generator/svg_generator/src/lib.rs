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

    // SVG String & hard-coded arrays
    let svg_string_one = "";
    let colors: Vec<String> = vec![];
    let names: Vec<String> = vec![];
    let svg_string_two = "";

    // Indexing of said arrays using rand numbers
    let color = colors.get(random_numbers.random_1 as usize);
    let name = names.get(random_numbers.random_2 as usize);

    // Generation of svg
    let final_svg_string = "";
    let svg_data = SvgData { image: final_svg_string.to_string() };

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