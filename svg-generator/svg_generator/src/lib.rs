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
    let svg_string_one = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='".to_string();
    let colors: Vec<String> = vec!["#f143f7".to_string(), "#fcff33".to_string(), "#00ffd0".to_string(), "#07f702".to_string(), "#ff2448".to_string(), "#ff771c".to_string()];
    let first_words: Vec<&str> = vec!["Pink".to_string(), "Orange".to_string(), "Yellow".to_string(), "Scarlet".to_string(), "Ivy".to_string(), "Aqua".to_string()];
    let second_words: Vec<String> = vec!["Positive".to_string(), "Majestic".to_string(), "Empowered".to_string(), "Heroic".to_string(), "Fierce".to_string(), "Tranquil".to_string()];
    let third_words: Vec<String> = vec!["Llama".to_string(), "Sun".to_string(), "Moon".to_string(), "Cactus".to_string(), "Tree".to_string(), "Rainbow".to_string()];
    let svg_string_two = "' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>".to_string();

    // Indexing of said arrays using rand numbers
    let color = colors.get(random_numbers.random_1 as usize);
    let first_word = first_words.get(random_numbers.random_2 as usize);
    let second_word = second_words.get(random_numbers.random_3 as usize);
    let third_word = third_words.get(random_numbers.random_4 as usize);

    // Generation of svg
    let final_svg_string = svg_string_one + color + svg_string_two + first_word + second_word + third_word + "</text></svg>".to_string();
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