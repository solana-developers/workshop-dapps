import { FC } from 'react';
import QrCodeGen from './QrCodeGen';


const WorkshopLinks: FC = () => {

    const VERCEL_URL = "https://svg-generator-jpcaulfi.vercel.app/";
    const SOURCE_URL = "https://github.com/solana-developers/workshop-dapps/tree/main/svg-generator";
    const SOLPG_URL = "https://beta.solpg.io";

    return(
        <div className='flex flex-row rounded-md border-2 border-[#2b2b2b]'>
            <QrCodeGen header='This page:' url={VERCEL_URL} />
            <QrCodeGen header='Source code:' url={SOURCE_URL} />
            <QrCodeGen header='SolPG IDE:' url={SOLPG_URL} />
        </div>
    )
}

export default WorkshopLinks;