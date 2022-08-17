import { FC } from 'react';
import pkg from '../../../package.json';
import { SolanaTwitter } from 'components/SolanaTwitter';


export const HomeView: FC = ({ }) => {

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="mt-4 text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#74a8fc] to-[#c6ecf7]">
          Solana Twitter <span className='text-sm font-normal align-top text-slate-700'>v{pkg.version}</span>
        </h1>
        <SolanaTwitter />
      </div>
    </div>
  );
};
