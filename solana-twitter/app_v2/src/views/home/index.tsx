import { FC } from 'react';
import pkg from '../../../package.json';
import { SolanaTwitter } from 'components/SolanaTwitter';


export const HomeView: FC = ({ }) => {

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="mt-2 text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#74a8fc] to-[#c6ecf7]">
          Solana Twitter
        </h1>
        <SolanaTwitter />
      </div>
    </div>
  );
};
