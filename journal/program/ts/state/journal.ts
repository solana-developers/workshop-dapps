import { Assignable } from '../util/util';
import * as borsh from "borsh";
import { Buffer } from "buffer";


export class JournalMetadata extends Assignable {
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