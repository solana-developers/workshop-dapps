import Card from "components/common/Card"
import { FC, useEffect, useState } from "react"

interface WeaponProps {
    data: WeaponPropsData,
    userIsInSquad: boolean,
    weaponIsSelected: boolean,
    chooseWeapon: (weaponId: number) => void,
}

interface WeaponPropsData {
    id: number,
    icon: string,
    weaponName: string,
    damage: number,
}

export const Weapon: FC<WeaponProps> = (props: WeaponProps) => {

    const [isSelected, setIsSelected] = useState<boolean>(false);

    const handleOnClick = () => {
        setIsSelected(!isSelected)
        props.chooseWeapon(props.data.id)
    }

    useEffect(() => {
        setIsSelected(props.weaponIsSelected);
    }, [props.weaponIsSelected])

    return(
        <div className={`${props.weaponIsSelected ? 'text-opacity-50' : ''}`}>
            <button
                onClick={handleOnClick}
            >
                <Card 
                    className={`mt-2 mb-2 w-48 h-40 p-4 font-serif space-y-2 ${!isSelected ? 'hover:' : ''}bg-[#8debbd] ${!isSelected ? 'hover:' : ''}bg-opacity-50 `}
                >
                    <p className="text-4xl">{props.data.icon}</p>
                    <p className="text-2xl font-heavy">{props.data.weaponName}</p>
                    <p className="font-medium">Damage: <span className="pl-2 font-sans text-[#ebb134]">{props.data.damage}</span></p>
                </Card>
            </button>
        </div>
    )
}