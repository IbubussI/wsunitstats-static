import { PlayerTable } from '@/pages/ReplaysPage/ReplayInfo/PlayerTable';
import { GeneralTable } from '@/pages/ReplaysPage/ReplayInfo/GeneralTable';
import { useOutletContext } from 'react-router-dom';
import type { ReplayParseResult } from './replayStructure';
import { ChartViewer } from './ChartViewer';
import { StatsTable } from '@/pages/ReplaysPage/StatsTable';
import { Awards } from './Awards';
import { Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SectionTitle } from '@/pages/ReplaysPage/SectionTitle';

export const ReplayInfo = () => {
  const { t } = useTranslation();
  const replayInfo = useOutletContext<ReplayParseResult>();
  const id = `replay-info-${replayInfo.match.replayCode}`;

  return (
    <Stack gap={1}>
      <Box>
        <SectionTitle>{t('replayGeneralTableTitle')}</SectionTitle>
        <GeneralTable replayInfo={replayInfo} />
      </Box>
      <Box>
        <SectionTitle>{t('replayPlayerTableTitle')}</SectionTitle>
        <PlayerTable replayInfo={replayInfo} />
      </Box>
      {/* has its own title, the whole section is absent if nobody is awarded */}
      <Awards replayInfo={replayInfo} />
      <Box>
        <SectionTitle>{t('replayStatsTitle')}</SectionTitle>
        {/* remount to have the default view when replay changes */}
        <StatsTable key={id} replayInfo={replayInfo} />
      </Box>
      <Box>
        <SectionTitle>{t('replayChartsTitle')}</SectionTitle>
        {/* remount charts to have a default view when replay changes */}
        <ChartViewer key={id} id={id} replayInfo={replayInfo} />
      </Box>
    </Stack>
  );
};
