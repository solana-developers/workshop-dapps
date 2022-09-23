import * as borsh from "borsh";
import { Buffer } from "buffer";


export class SvgData {

    image: string;

    constructor(props: {
        name: string,
        description: string,
        image: string,
    }) {
        this.image = props.image;
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(SvgDataSchema, SvgData, buffer);
    };
};

export const SvgDataSchema = new Map([
    [ SvgData, { 
        kind: 'struct', 
        fields: [ 
            ['image', 'string'],
        ],
    }]
]);


export class RandomNumbers {

    random_1: number;
    random_2: number;
    random_3: number;
    random_4: number;

    constructor(props: {
        random_1: number,
        random_2: number,
        random_3: number,
        random_4: number,
    }) {
        this.random_1 = props.random_1;
        this.random_2 = props.random_2;
        this.random_3 = props.random_3;
        this.random_4 = props.random_4;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(RandomNumbersSchema, this)) 
    };
};

export const RandomNumbersSchema = new Map([
    [ RandomNumbers, { 
        kind: 'struct', 
        fields: [ 
            ['random_1', 'u8'],
            ['random_2', 'u8'],
            ['random_3', 'u8'],
            ['random_4', 'u8'],
        ],
    }]
]);

export function getRandomNumberData(): Buffer {
    return new RandomNumbers({
        random_1: generateRandomNumber(),
        random_2: generateRandomNumber(),
        random_3: generateRandomNumber(),
        random_4: generateRandomNumber(),
    }).toBuffer();
};

function generateRandomNumber(): number {
    const min = 0;
    const max = 4;
    return Math.random() * (max - min) + min;
};