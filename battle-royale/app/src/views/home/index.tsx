import { BattleRoyale } from 'components/battle-royale/BattleRoyale';
import { FC } from 'react';

export const HomeView: FC = ({ }) => {

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <BattleRoyale />
      </div>
    </div>
  );
};
