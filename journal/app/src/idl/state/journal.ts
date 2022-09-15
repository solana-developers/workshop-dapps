import { PublicKey } from "@solana/web3.js";
import * as borsh from "borsh";
import { Buffer } from "buffer";


export class JournalMetadata {

    nickname: string;
    authority: PublicKey;
    entries: number;
    bump: number;

    constructor(props: {
        nickname: string,
        authority: PublicKey,
        entries: number,
        bump: number,
    }) {
        this.nickname = props.nickname;
        this.authority = props.authority;
        this.entries = props.entries;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(JournalMetadataSchema, this)) 
    };
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(JournalMetadataSchema, JournalMetadata, buffer);
    };
};

export const JournalMetadataSchema = new Map([
    [ JournalMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['nickname', 'string'],
            ['authority', [32]],
            ['entries', 'u32'],
            ['bump', 'u8'],
        ],
    }]
]);