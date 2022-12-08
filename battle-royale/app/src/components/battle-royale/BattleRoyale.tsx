import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { 
    createHeroInstruction, 
    getAllMagic, 
    getAllHeroes, 
    getAllWeapons, 
    getHero, 
    getHeroAddress, 
    sendTransaction, 
    createEquippedMagicInstruction, 
    getAllEquippedMagics
} from "../../lib";
import { Hero } from "./Hero";
import { Weapon } from "./Weapon";
import { Magic } from "./Magic";
import Card from "components/common/Card";
import { FC, useEffect, useState } from "react";

export const BattleRoyale: FC = () => {

    const wallet = useAnchorWallet();

    const [heroes, setHeroes] = useState([]);
    const [weapons, setWeapons] = useState([]);
    const [magics, setMagics] = useState([]);
    const [equippedMagics, setEquippedMagics] = useState([]);

    const [enteredIcon, setEnteredIcon] = useState<string>();
    const [enteredName, setEnteredName] = useState<string>();

    const [selectedWeapon, setSelectedWeapon] = useState<number>(0);
    const [selectedMagics, setSelectedMagics] = useState<number[]>([]);
    
    const [userIsInSquad, setUserIsInSquad] = useState<boolean>(false);

    const currentHeroAddress = async () => await getHeroAddress(wallet, wallet.publicKey);

    const loadBarracks = async (wallet) => {
        const heroes: any[] = await getAllHeroes(wallet);
        setHeroes(heroes);
        setWeapons((await getAllWeapons(wallet)).sort((a: any, b: any) => a.damage > b.damage ? 1 : -1));
        setMagics((await getAllMagic(wallet)).sort((a: any, b: any) => a.damageIncrease > b.damageIncrease ? 1 : -1));
        // setEquippedMagics((await getAllEquippedMagics(wallet)).sort((a: any, b: any) => a.id > b.id ? 1 : -1));
        if (heroes.map(h => h.id).includes(wallet.publicKey)) setUserIsInSquad(true);
    }

    const chooseWeapon = (weaponId) => setSelectedWeapon(weaponId);

    const chooseMagic = (magicId) => selectedMagics.includes(magicId) ?
        setSelectedMagics(selectedMagics.filter(o => o != magicId))
        :
        setSelectedMagics(selectedMagics.concat(magicId));
    
    const handleOnClickJoinSquad = async () => {
        const ixList = []
        ixList.push(await createHeroInstruction(wallet, wallet.publicKey, enteredIcon, enteredName, selectedWeapon));
        let id = equippedMagics.length;
        // for (const magicId of selectedMagics) {
        //     ixList.push(await createEquippedMagicInstruction(wallet, id, wallet.publicKey, magicId))
        //     id++;
        // };
        await sendTransaction(wallet, ixList);
        setHeroes((await getAllHeroes(wallet)));
    };

    useEffect(() => {
        if (wallet) {
            loadBarracks(wallet);
        };
    }, [wallet, userIsInSquad])

    return(
        <div>
            { wallet ? 
                <div className="font-serif w-full">
                    {/* <p>Selected Weapon: {selectedWeapon}</p>
                    <p>Selected Magics: {selectedMagics.length}</p> */}
                    { userIsInSquad ?
                        <div className="my-10 text-center text-lg font-sans">
                            <p>You're in the Squad.</p>
                            <p>Good luck out there, mates.</p>
                        </div>
                        :
                        <div>
                            <div className="mb-2 flex flex-row">
                                <p className="text-3xl align-left font-medium"
                                >
                                    Weapons:
                                </p>
                                <p className="pl-6 text-xl align-left font-light h-auto my-auto font-sans"
                                >
                                    (Select 1)
                                </p>
                            </div>
                            <div className="mt-2 flex flex-row space-x-4">
                                { weapons.map((o, i) => <Weapon 
                                    key={i} 
                                    data={{...o}}
                                    userIsInSquad={userIsInSquad}
                                    chooseWeapon={chooseWeapon}
                                    weaponIsSelected={selectedWeapon === o.id}
                                />) }
                            </div>
                            <div className="mb-2 flex flex-row">
                                <p className="mt-4 mb-2 text-3xl align-left font-medium"
                                >
                                    Magic:
                                </p>
                                <p className="pl-6 text-xl align-left font-light h-auto my-auto font-sans"
                                >
                                    (Select Multiple)
                                </p>
                            </div>
                            <div className="mt-2 flex flex-row space-x-4 w-full">
                                { magics.map((o, i) => <Magic 
                                    key={i} 
                                    data={{...o}}
                                    userIsInSquad={userIsInSquad}
                                    chooseMagic={chooseMagic}
                                />) }
                            </div>
                            { !userIsInSquad && 
                                <div className="flex flex-row flex-auto space-x-4 my-8">
                                    <input 
                                        className="text-lg border-2 rounded-lg border-[#6e6e6e] px-6 py-2 bg-[#1f1f1f]"
                                        type="text" 
                                        placeholder="Enter your hero's name" 
                                        onChange={e => setEnteredName(e.target.value)}/>
                                    <input 
                                        className="text-lg border-2 rounded-lg border-[#6e6e6e] px-6 py-2 ml-4 bg-[#1f1f1f]"
                                        type="text" 
                                        placeholder="Enter your hero's emoji" 
                                        onChange={e => setEnteredIcon(e.target.value)}/>
                                    { selectedWeapon != 0 && selectedMagics.length != 0 && enteredName && enteredIcon &&
                                        <button
                                            onClick={handleOnClickJoinSquad}
                                        >
                                            <Card className="py-2 mx-auto w-72 text-center bg-[#1f89ed] bg-opacity-30 animate-pulse">
                                                <div className="">
                                                    <p className="text-3xl text-[#1f89ed]">Join the Squad</p>
                                                </div> 
                                            </Card>
                                        </button>
                                    }
                                </div>
                            }
                        </div>
                    }
                    <p className="mt-4 mb-2 text-3xl align-left font-medium"
                        >
                            Heroes:
                        </p>
                    <div className="mt-2 flex flex-col min-w-full">
                        { heroes.map((o, i) => <Hero 
                            key={i} 
                            data={{
                                currentEquippedMagic: equippedMagics
                                    .filter(m => m.heroId === o.heroId)
                                    .map(m => m.magicId),
                                ...o,
                            }}
                            isCurrentUser={currentHeroAddress === o.publicKey}
                        />) }
                    </div>
                </div>
                :
                <div>Connect your wallet.</div>
            }
        </div>
    )
}