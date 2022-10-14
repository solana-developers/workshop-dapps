import { FC } from 'react';
import pkg from '../../../package.json';
import { SolanaTwitter } from 'components/SolanaTwitter';


export const HomeView: FC = ({ }) => {

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <SolanaTwitter />
      </div>
    </div>
  );
};
