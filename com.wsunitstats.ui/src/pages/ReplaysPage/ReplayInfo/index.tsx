import * as React from 'react';
import { PlayerTable } from '@/pages/ReplaysPage/ReplayInfo/PlayerTable';
import { GeneralTable } from '@/pages/ReplaysPage/ReplayInfo/GeneralTable';
import { ChartViewer } from './ChartViewer';
import { StatsTable } from '@/pages/ReplaysPage/StatsTable';
import { Awards } from './Awards';
import { Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SectionTitle } from '@/pages/ReplaysPage/SectionTitle';
import { useReplayOutletContext } from '@/pages/ReplaysPage/replayOutletContext';
import { useTransferMarkers } from './transferMarkers';
import { buildActivityChart } from './playerActivity';
import type { Player, Team } from './replayStructure';

export const ReplayInfo = () => {
  const { t } = useTranslation();
  const { replayInfo, extraData } = useReplayOutletContext();
  const id = `replay-info-${replayInfo.match.replayCode}`;
  const transferMarkers = useTransferMarkers(replayInfo, extraData);
  // the activity chart is the last one
  const charts = React.useMemo(() => {
    const timeLine = replayInfo.timeLine ?? [];
    if (!extraData) {
      return timeLine;
    }
    const players: Player[] = replayInfo.teams
      .filter((team: Team) => team.isPlayerTeam)
      .flatMap((team: Team) => team.players.map((playerId: number) => replayInfo.players[playerId]));
    const activityChart = buildActivityChart(players, extraData, replayInfo.timeLinePeriod, replayInfo.match.duration);
    return activityChart ? [...timeLine, activityChart] : timeLine;
  }, [replayInfo, extraData]);

  return (
    <Stack gap={1}>
      <Box>
        <SectionTitle>{t('replayGeneralTableTitle')}</SectionTitle>
        <GeneralTable replayInfo={replayInfo} />
      </Box>
      <Box>
        <SectionTitle>{t('replayPlayerTableTitle')}</SectionTitle>
        <PlayerTable replayInfo={replayInfo} extraData={extraData} />
      </Box>
      {/* has its own title, the whole section is absent if nobody is awarded */}
      <Awards replayInfo={replayInfo} extraData={extraData} />
      <Box>
        <SectionTitle>{t('replayStatsTitle')}</SectionTitle>
        {/* remount to have the default view when replay changes */}
        <StatsTable key={id} replayInfo={replayInfo} extraData={extraData} />
      </Box>
      {/* no timeline in incomplete replays and in matches that ended before the first timeline period */}
      {charts.length > 0 && <Box>
        <SectionTitle>{t('replayChartsTitle')}</SectionTitle>
        {/* remount charts to have a default view when replay changes */}
        <ChartViewer key={id} id={id} charts={charts} timeLinePeriod={replayInfo.timeLinePeriod} markerProvider={transferMarkers} />
      </Box>}
    </Stack>
  );
};
