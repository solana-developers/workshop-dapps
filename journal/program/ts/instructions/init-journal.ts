import { Assignable, InstructionType } from '../util/util';
import * as borsh from "borsh";
import { Buffer } from "buffer";
import { 
    PublicKey, 
    SystemProgram,
    TransactionInstruction 
} from '@solana/web3.js';


export class InitJournal extends Assignable {
    toBuffer() { 
        return Buffer.from(borsh.serialize(InitJournalSchema, this)) 
    };
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(InitJournalSchema, InitJournal, buffer);
    };
};

export const InitJournalSchema = new Map([
    [ InitJournal, { 
        kind: 'struct', 
        fields: [ 
            ['nickname', 'string'],
            ['bump', 'u8'],
        ],
    }]
]);

export function createInitializeJournalInstruction(
    payer: PublicKey,
    programId: PublicKey,
): [TransactionInstruction, PublicKey] {

    const [journalAddress, journalBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("journal"),
            payer.toBuffer(),
        ],
        programId
    );

    const initInstructionObject = new InitJournal({
        nickname: "Joe's Journal",
        bump: journalBump,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: journalAddress, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: programId,
        data: initInstructionObject.toBuffer(),
    });

    return [ix, journalAddress];
}