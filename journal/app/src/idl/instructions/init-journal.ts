import * as borsh from "borsh";
import { Buffer } from "buffer";
import { 
    PublicKey, 
    SystemProgram,
    TransactionInstruction 
} from '@solana/web3.js';
import { JournalInstruction } from './instruction';


export class InitJournal {

    instruction: JournalInstruction;
    nickname: string;
    bump: number;

    constructor(props: {
        instruction: JournalInstruction,
        nickname: string,
        bump: number,
    }) {
        this.instruction = props.instruction;
        this.nickname = props.nickname;
        this.bump = props.bump;
    }

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
            ['instruction', 'u8'],
            ['nickname', 'string'],
            ['bump', 'u8'],
        ],
    }]
]);

export async function createInitializeJournalInstruction(
    payer: PublicKey,
    programId: PublicKey,
    nickname: string,
): Promise<[TransactionInstruction, PublicKey]> {

    const [journalAddress, journalBump] = await PublicKey.findProgramAddress(
        [
            Buffer.from("journal"),
            payer.toBuffer(),
        ],
        programId
    );

    const initInstructionObject = new InitJournal({
        instruction: JournalInstruction.InitJournal,
        nickname: nickname,
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