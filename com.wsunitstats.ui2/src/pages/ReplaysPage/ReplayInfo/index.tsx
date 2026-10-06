import { PlayerTable } from '@/pages/ReplaysPage/ReplayInfo/PlayerTable';
import { GeneralTable } from '@/pages/ReplaysPage/ReplayInfo/GeneralTable';
import { useOutletContext } from 'react-router-dom';
import type { ReplayParseResult } from './replayStructure';
import { ChartViewer } from './ChartViewer';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const ReplayInfo = () => {
  const { t } = useTranslation();
  const replayInfo = useOutletContext<ReplayParseResult>();
  const id = `replay-info-${replayInfo.match.replayCode}`;

  return (
    <Stack gap={1}>
      <Box>
        <Typography variant="h5" gutterBottom>
          {t('replayGeneralTableTitle')}
        </Typography>
        <GeneralTable replayInfo={replayInfo} />
      </Box>
      <Box>
        <Typography variant="h5" gutterBottom>
          {t('replayPlayerTableTitle')}
        </Typography>
        <PlayerTable replayInfo={replayInfo} />
      </Box>
      <Box>
        <Typography variant="h5" gutterBottom>
          {t('replayChartsTitle')}
        </Typography>
        {/* remount charts to have a default view when replay changes */}
        <ChartViewer key={id} id={id} replayInfo={replayInfo} />
      </Box>
    </Stack>
  );
};
