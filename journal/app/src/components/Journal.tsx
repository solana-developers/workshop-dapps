import { FC, useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useJournalStore from "stores/useJournalStore";
import useEntryStore from "stores/useEntryStore";
import { PublicKey, Transaction } from "@solana/web3.js";
import { createInitializeJournalInstruction } from '../idl/instructions/init-journal';
import { createNewEntryInstruction } from "../idl/instructions/new-entry";


export const Journal: FC = () => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [ programId, setProgramId ] = useState<PublicKey>(
        new PublicKey("J1aqi2DijQwGTQJvBqGfFxNQYXpJsKeCcGJwpSurWjSd")
    );

    const [ journalNickname, setJournalNickname ] = useState<string>(undefined);
    const [ entryMessage, setEntryMessage ] = useState<string>(undefined);

    const { journal, getJournal } = useJournalStore();
    const { entries, getEntries } = useEntryStore();

    const onClickCreateJournal = useCallback(async () => {
        const [ix, _] = await createInitializeJournalInstruction(
            publicKey, 
            programId,
            journalNickname,
        );
        await connection.confirmTransaction(await sendTransaction(
            new Transaction().add(ix),
            connection, 
        ));
        getJournal(publicKey, programId, connection);
    }, [publicKey, journalNickname, getJournal]);

    const onClickCreateEntry = useCallback(async () => {
        const [ix, _] = await createNewEntryInstruction(
            connection,
            publicKey, 
            programId,
            entryMessage,
        );
        await connection.confirmTransaction(await sendTransaction(
            new Transaction().add(ix),
            connection, 
        ));
        getEntries(publicKey, programId, connection);
    }, [publicKey, entryMessage, getEntries]);

    useEffect(() => {
        getJournal(publicKey, programId, connection);
        getEntries(publicKey, programId, connection);
    }, [publicKey, getJournal, getEntries]);

    return(
        <div>
            { publicKey ? 
                <div className="text-center">
                    { journal ? 
                        <div>
                            <div>
                                <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text text-[#89eb34] mb-6">
                                    <p><span className="text-[#68ccca]">Journal: </span>{journal.nickname}</p>
                                </h1>
                                <div className="border-2 rounded-lg border-[#6e6e6e] px-4 py-2 bg-[#1f1f1f]">
                                    <input className="w-72 h-12 text-black px-4 rounded-md" 
                                        type="text" placeholder="Write something..." 
                                        onChange={e => setEntryMessage(e.target.value)}
                                    />
                                    <button className="text-lg text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 ml-4 bg-[#68ccca]" 
                                        onClick={() => onClickCreateEntry()}>
                                            <span>Publish</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                {entries && entries.map(
                                    (e, i) => { return(
                                    <div className="border-2 rounded-lg border-[#6e6e6e] my-2 px-4 py-2 bg-[#1f1f1f]" key={i}>
                                        <span className="text-lg">{e.message}</span>
                                    </div>
                                    ) }
                                )}
                            </div>
                        </div>
                        :
                        <div className="border-2 rounded-lg border-[#6e6e6e] px-4 py-2 bg-[#1f1f1f]">
                            <input className="w-72 h-12 text-black px-4 rounded-md" 
                                type="text" placeholder="Enter a nickname for your journal" 
                                onChange={e => setJournalNickname(e.target.value)}
                            />
                            <button className="text-lg text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 ml-4 bg-[#68ccca]" 
                                onClick={() => onClickCreateJournal()}>
                                    <span>Create Journal</span>
                            </button>
                        </div>
                    }
                </div>
                : 
                <div>
                    <p className="text-center text-2xl my-6 animate-pulse text-[#68ccca]">
                        Connect your wallet!
                    </p>
                </div>
            }
        </div>
    )

};