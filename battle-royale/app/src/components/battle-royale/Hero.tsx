import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js"
import Card from "components/common/Card"
import { getMagic, getWeapon } from "lib";
import { FC, useEffect, useState } from "react"

interface HeroProps {
    data: HeroPropsData,
    isCurrentUser: boolean,
}

interface HeroPropsData {
    publicKey: PublicKey,
    id: PublicKey,
    icon: string,
    name: string,
    kills: number,
    currentWeapon: number,
    currentEquippedMagic: number[],
}

export const Hero: FC<HeroProps> = (props: HeroProps) => {

    const wallet = useAnchorWallet();

    const [currentWeapon, setCurrentWeapon] = useState<any>();
    const [currentEquippedMagic, setCurrentEquippedMagic] = useState<any[]>();

    const loadCurrentWeapon = async() => setCurrentWeapon(await getWeapon(wallet, props.data.currentWeapon));

    const loadCurrentEquippedMagic = async () => {
        let currentEquippedMagic = [];
        for (const equippedMagicId of props.data.currentEquippedMagic) {
            currentEquippedMagic.push(await getMagic(wallet, equippedMagicId))
        };
        setCurrentEquippedMagic(currentEquippedMagic);
    }

    useEffect(() => {
        loadCurrentWeapon();
        loadCurrentEquippedMagic();
    }, [wallet])

    return(
        <div className="min-w-full text-left">
            <Card 
                className="mt-2 mb-2 min-w-full h-30 p-4 font-serif space-y-2"
            >
                { props.isCurrentUser && <Card className="w-24 text-center text-[#34eb92] bg-[#34eb92] bg-opacity-30">
                <p>You</p>
            </Card>}
                <div className="flex flex-row min-h-full m-auto">
                    <div className="m-auto px-4 align-middle h-full">
                        <p className="text-4xl">{props.data.icon}</p>
                    </div>
                    <div className="m-auto pl-4 flex flex-row space-x-2 h-full">
                        <p className="text-2xl font-heavy">{props.data.name}</p>
                        <p className="m-auto pl-6 font-medium h-auto">Kills: <span className="pl-2 font-sans text-[#ebb134]">{props.data.kills}</span></p>
                    </div>
                    { currentWeapon && <div className="m-auto pl-10 flex flex-row space-x-2 h-full">
                        <p className="m-auto text-2xl font-heavy">{currentWeapon.icon}</p>
                        <p className="m-auto pl-4 text-xl font-heavy">{currentWeapon.weaponName}</p>
                    </div>}
                    { currentEquippedMagic && <div className="m-auto flex flex-row space-x-2 h-full">
                        { currentEquippedMagic.map(o => <p className="pl-4 text-2xl font-heavy">{o.icon}</p>)}
                    </div>}
                </div>
            </Card>
        </div>
    )
}