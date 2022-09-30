use borsh::{ BorshDeserialize, BorshSerialize };


pub const SVG_STRING_ONE: &str = "<svg \
    xmlns='http://www.w3.org/2000/svg' \
    preserveAspectRatio='xMinYMin meet' \
    viewBox='0 0 350 350'><style>.base \
    { fill: white; font-family: serif; \
    font-size: 24px; }</style><rect \
    width='100%' height='100%' fill='";

pub const COLORS_LIST: [&str; 6] = [
    "#f143f7", 
    "#fcff33", 
    "#00ffd0", 
    "#07f702", 
    "#ff2448", 
    "#ff771c",
];

pub const FIRST_WORDS_LIST: [&str; 6] = [
    "Pink", 
    "Orange", 
    "Yellow", 
    "Scarlet", 
    "Ivy", 
    "Aqua",
];

pub const SECOND_WORDS_LIST: [&str; 6] = [
    "Positive", 
    "Majestic", 
    "Empowered", 
    "Heroic", 
    "Fierce", 
    "Tranquil",
];

pub const THIRD_WORDS_LIST: [&str; 6] = [
    "Llama", 
    "Sun", 
    "Moon", 
    "Cactus", 
    "Tree", 
    "Rainbow",
];

pub const SVG_STRING_TWO: &str = "' /><text x='50%' \
    y='50%' class='base' dominant-baseline='middle' \
    text-anchor='middle'>";

// Builds a random SVG string from the above components
pub fn build_random_svg_data(
    random_numbers: RandomNumbers
) -> SvgData {

    // Indexing of word arrays using rand numbers
    let color = COLORS_LIST.get(random_numbers.random_1 as usize)
        .expect("Index out of range.");
    let first_word = FIRST_WORDS_LIST.get(random_numbers.random_2 as usize)
        .expect("Index out of range.");
    let second_word = SECOND_WORDS_LIST.get(random_numbers.random_3 as usize)
        .expect("Index out of range.");
    let third_word = THIRD_WORDS_LIST.get(random_numbers.random_4 as usize)
        .expect("Index out of range.");

    // Generation of svg string & creation of data object
    let final_svg_string = String::from(SVG_STRING_ONE) + color 
        + SVG_STRING_TWO + first_word + " " + second_word + " " 
        + third_word + " " + "</text></svg>";
    
    SvgData { 
        image: final_svg_string, 
    }
}


// **
// Our program's instruction data
// **
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct RandomNumbers {
    random_1: u8,
    random_2: u8,
    random_3: u8,
    random_4: u8,
}

// **
// Our account's data type
// **
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct SvgData {
    image: String,
}