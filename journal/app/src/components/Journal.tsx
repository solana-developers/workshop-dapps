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
        new PublicKey("HAhEvS67NL6R7EmJkc5kGE1Bd7tXFj8M4KPTQ1jS49jE")
    );

    const [ journalInit, setJournalInit ] = useState<boolean>(false);
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
        await sendTransaction(
            new Transaction().add(ix),
            connection, 
        );
        setJournalNickname(journalNickname);
        setJournalInit(true);
        getJournal(publicKey, programId, connection);
    }, [
        publicKey, 
        programId, 
        connection, 
        journalNickname, 
        setJournalNickname, 
        journalInit, 
        setJournalInit, 
        getJournal
    ]);

    const onClickCreateEntry = useCallback(async () => {
        const [ix, _] = await createNewEntryInstruction(
            connection,
            publicKey, 
            programId,
            entryMessage,
        );
        await sendTransaction(
            new Transaction().add(ix),
            connection, 
        );
        setEntryMessage(undefined);
        getEntries(publicKey, programId, connection);
    }, [
        publicKey, 
        programId, 
        connection, 
        entryMessage, 
        setEntryMessage, 
        getEntries
    ]);

    useEffect(() => {
        getJournal(publicKey, programId, connection);
        if (journal) { setJournalInit(true) };
        getEntries(publicKey, programId, connection);
    }, [
        publicKey, 
        programId, 
        connection, 
        journal, 
        getJournal, 
        journalInit, 
        setJournalInit
    ]);

    return(
        <div>
            { publicKey ? 
                <div className="">
                    { journalInit ? 
                        <div>
                            <div className="">
                                <p className="">Nickname: {journalNickname}</p>
                                <input className="" 
                                    type="text" placeholder="Write something..." 
                                    onChange={e => setEntryMessage(e.target.value)}
                                />
                                <button className="" 
                                    onClick={() => onClickCreateEntry()}>
                                        <span>Publish</span>
                                </button>
                            </div>
                            <div className="">
                                {entries && entries.map(
                                    (e) => { return(
                                    <div className="">
                                        <span className="">{e.message}</span>
                                    </div>
                                    ) }
                                )}
                            </div>
                        </div>
                        :
                        <div className="">
                            <input className="" 
                                type="text" placeholder="Enter a nickname for your journal" 
                                onChange={e => setJournalNickname(e.target.value)}
                            />
                            <button className="" 
                                onClick={() => onClickCreateJournal()}>
                                    <span>Create Journal</span>
                            </button>
                        </div>
                    }
                </div>
                : 
                <div className="">
                    <p className="">
                        Connect your wallet!
                    </p>
                </div>
            }
        </div>
    )

};