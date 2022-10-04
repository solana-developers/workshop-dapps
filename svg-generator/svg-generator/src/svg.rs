use borsh::{ BorshDeserialize, BorshSerialize };


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

// **
// Builds the SVG string from random indexes
// **
impl SvgData {

    fn new_with_root() -> SvgData {
        SvgData {
            image: "<svg xmlns='http://www.w3.org/2000/svg' \
                preserveAspectRatio='xMinYMin meet' \
                viewBox='0 0 350 350' width='50%' \
                height='50%'>\
                <style>.base \
                { fill: white; font-family: serif; font-size: 52px; }\
                </style><rect width='100%' height='100%' fill='".to_string()
        }
    }

    fn add_fill(&mut self, fill_index: u8) {
        self.image += [
            "#f143f7", 
            "#fcff33", 
            "#00ffd0", 
            "#07f702", 
            "#ff2448", 
            "#ff771c",
        ].get(fill_index as usize)
            .expect("Index out of range.");
        self.image += "'/>";
    }

    fn add_text_one(&mut self, text_one_index: u8) {
        self.image += "<text x='50%' y='25%' \
            class='base' dominant-baseline='middle' \
            text-anchor='middle'>";
        self.image += [
            "Pink", 
            "Orange", 
            "Yellow", 
            "Scarlet", 
            "Ivy", 
            "Aqua",
        ].get(text_one_index as usize)
            .expect("Index out of range.");
        self.image += "</text>";
    }

    fn add_text_two(&mut self, text_two_index: u8) {
        self.image += "<text x='50%' y='50%' \
            class='base' dominant-baseline='middle' \
            text-anchor='middle'>";
        self.image += [
            "Positive", 
            "Majestic", 
            "Empowered", 
            "Heroic", 
            "Fierce", 
            "Tranquil",
        ].get(text_two_index as usize)
            .expect("Index out of range.");
        self.image += "</text>";
    }

    fn add_text_three(&mut self, text_three_index: u8) {
        self.image += "<text x='50%' y='75%' \
            class='base' dominant-baseline='middle' \
            text-anchor='middle'>";
        self.image += [
            "Llama", 
            "Sun", 
            "Moon", 
            "Cactus", 
            "Tree", 
            "Rainbow",
        ].get(text_three_index as usize)
            .expect("Index out of range.");
        self.image += "</text>";
    }

    fn add_cap(&mut self) {
        self.image += "</svg>";
    }

    pub fn new_from_randoms(random_numbers: RandomNumbers) -> SvgData {
        let mut svg_data = SvgData::new_with_root();
        svg_data.add_fill(random_numbers.random_1);
        svg_data.add_text_one(random_numbers.random_2);
        svg_data.add_text_two(random_numbers.random_3);
        svg_data.add_text_three(random_numbers.random_4);
        svg_data.add_cap();
        return svg_data
    }
}