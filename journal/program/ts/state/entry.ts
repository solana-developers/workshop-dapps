import * as borsh from "borsh";
import { Buffer } from "buffer";
import { Assignable } from '../util/util';


export class JournalEntry extends Assignable {
    toBuffer() { 
        return Buffer.from(borsh.serialize(JournalEntrySchema, this)) 
    };
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(JournalEntrySchema, JournalEntry, buffer);
    };
};

export const JournalEntrySchema = new Map([
    [ JournalEntry, { 
        kind: 'struct', 
        fields: [ 
            ['entry_number', 'u32'],
            ['message', 'string'],
            ['journal', [32]],
            ['bump', 'u8'],
        ],
    }]
]);