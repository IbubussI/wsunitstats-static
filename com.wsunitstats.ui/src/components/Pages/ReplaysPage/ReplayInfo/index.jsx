import * as React from 'react';
import { PlayerTable } from 'components/Pages/ReplaysPage/ReplayInfo/PlayerTable';
import { GeneralTable } from 'components/Pages/ReplaysPage/ReplayInfo/GeneralTable';
import { useOutletContext } from 'react-router-dom';

export const ReplayInfoPage = () => {
  const replayInfo = useOutletContext();

  return (
    <>
      <GeneralTable replayInfo={replayInfo} />
      <PlayerTable replayInfo={replayInfo} />
    </>
  );
};