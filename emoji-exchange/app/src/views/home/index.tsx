// Next, React
import { FC } from 'react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import { EmojiExchange } from '../../components/EmojiExchange';

export const HomeView: FC = ({ }) => {

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col max-w-full">
        <h1 className="py-2 text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#f0940a] to-[#f0f00a]">
          Emoji Exchange
        </h1>   
        <div className="text-center">
          <RequestAirdrop />
        </div>
        <div>
          <EmojiExchange />
        </div>
      </div>
    </div>
  );
};
