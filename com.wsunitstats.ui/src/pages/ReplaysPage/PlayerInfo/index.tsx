import * as React from 'react';
import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import {
  Box,
  Button,
  Stack,
  Typography
} from '@mui/material';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import { Link, useParams } from 'react-router-dom';
import { UnitsInfoTabs } from './UnitsInfo';
import { useTranslation } from 'react-i18next';
import { SectionTitle } from '@/pages/ReplaysPage/SectionTitle';
import { GeneralTable } from './GeneralTable';
import { PlayerChartViewer } from './PlayerChartViewer';
import { getPlayerResources, getTransfers } from '@/pages/ReplaysPage/StatsTable';
import { useReplayOutletContext } from '@/pages/ReplaysPage/replayOutletContext';
import { useTransferMarkers } from '@/pages/ReplaysPage/ReplayInfo/transferMarkers';
import { buildActivityChart, calcApm, findPlayerActivity } from '@/pages/ReplaysPage/ReplayInfo/playerActivity';

export const PlayerInfo = () => {
  const { t } = useTranslation();
  const { replayInfo, extraData } = useReplayOutletContext();
  const params = useParams();
  const transferMarkers = useTransferMarkers(replayInfo, extraData);

  const playerIndex = Number(params.player);
  const player = replayInfo.players[playerIndex];
  const matchDuration = replayInfo.match.duration;
  const activity = findPlayerActivity(extraData, playerIndex, matchDuration);
  const transfers = React.useMemo(() => extraData && getTransfers(extraData), [extraData]);
  // the activity chart is the last one
  const charts = React.useMemo(() => {
    const timeLine = replayInfo.timeLine ?? [];
    const activityChart = extraData && buildActivityChart([player], extraData, replayInfo.timeLinePeriod, matchDuration);
    return activityChart ? [...timeLine, activityChart] : timeLine;
  }, [player, extraData, replayInfo.timeLine, replayInfo.timeLinePeriod, matchDuration]);

  return (
    <Stack gap={1}>
      <Box sx={{ py: 2 }}>
        <Button variant="contained" component={Link} sx={{ position: 'absolute' }}
          to={Utils.getUrlWithPathParams([{ param: Constants.REPLAY_INFO_PAGE_PATH, pos: 4 }], true, 5)}>
          <ArrowBackTwoToneIcon />
        </Button>
        <Box sx={{ flex: 1, textAlign: 'center'}}>
          <Typography variant="h5">
            {player.nickname}
          </Typography>
        </Box>
      </Box>
      <GeneralTable player={player}
        resources={getPlayerResources(replayInfo.timeLine)[playerIndex]}
        sent={transfers ? transfers.shared.get(playerIndex) ?? [0, 0, 0] : undefined}
        received={transfers ? transfers.received.get(playerIndex) ?? [0, 0, 0] : undefined}
        apm={activity && calcApm(activity)} />
      {(player.unitsCreatedOn || player.unitsKilledOn) &&
        <Box>
          <SectionTitle>{t('playerInfoUnitsTitle')}</SectionTitle>
          <UnitsInfoTabs player={player} />
        </Box>}
      {charts.length > 0 &&
        <Box>
          <SectionTitle>{t('playerInfoChartsTitle')}</SectionTitle>
          <PlayerChartViewer charts={charts} timeLinePeriod={replayInfo.timeLinePeriod} playerId={playerIndex}
            markerProvider={transferMarkers} />
        </Box>}
    </Stack>
  );
};
