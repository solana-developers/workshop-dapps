import { PublicKey } from "@solana/web3.js";
import * as borsh from "borsh";
import { Buffer } from "buffer";


export class EntryMetadata {

    entry_number: number;
    message: string;
    journal: PublicKey;
    bump: number;

    constructor(props: {
        entry_number: number,
        message: string,
        journal: PublicKey,
        bump: number,
    }) {
        this.entry_number = props.entry_number;
        this.message = props.message;
        this.journal = props.journal;
        this.bump = props.bump;
    }

    toBase58() {
        return borsh.serialize(EntryMetadataSchema, this).toString()
    };

    toBuffer() { 
        return Buffer.from(borsh.serialize(EntryMetadataSchema, this)) 
    };
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(EntryMetadataSchema, EntryMetadata, buffer);
    };
};

export const EntryMetadataSchema = new Map([
    [ EntryMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['entry_number', 'u32'],
            ['message', 'string'],
            ['journal', [32]],
            ['bump', 'u8'],
        ],
    }]
]);