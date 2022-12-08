import Card from "components/common/Card"
import { FC, useState } from "react"

interface MagicProps {
    data: MagicPropsData,
    userIsInSquad: boolean,
    chooseMagic: (magicId: number) => void,
}

interface MagicPropsData {
    id: number,
    icon: string,
    magicName: string,
    damageIncrease: number,
}

export const Magic: FC<MagicProps> = (props: MagicProps) => {

    const [isSelected, setIsSelected] = useState<boolean>(false);

    const handleOnClick = () => {
        setIsSelected(!isSelected)
        props.chooseMagic(props.data.id)
    }

    return(
        <div>
            <button
                onClick={handleOnClick}
            >
                <Card 
                    className={`mt-2 mb-2 w-48 h-40 p-4 font-serif space-y-2 ${!isSelected ? 'hover:' : ''}bg-[#8debbd] ${!isSelected ? 'hover:' : ''}bg-opacity-50 `}
                >
                    <p className="text-4xl">{props.data.icon}</p>
                    <p className="text-2xl font-heavy">{props.data.magicName}</p>
                    <p className="font-medium">Damage Boost: <span className="pl-2 font-sans text-[#34eb92]">{props.data.damageIncrease}</span></p>
                </Card>
            </button>
        </div>
    )
}