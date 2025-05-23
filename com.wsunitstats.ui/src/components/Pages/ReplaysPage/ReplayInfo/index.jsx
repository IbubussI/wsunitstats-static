import { PlayerTable } from 'components/Pages/ReplaysPage/ReplayInfo/PlayerTable';
import { GeneralTable } from 'components/Pages/ReplaysPage/ReplayInfo/GeneralTable';
import { useOutletContext } from 'react-router-dom';
import { ChartViewer } from './ChartViewer';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const ReplayInfo = () => {
  const { t } = useTranslation();
  const replayInfo = useOutletContext();

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
        <ChartViewer id={'replay-info'} replayInfo={replayInfo} />
      </Box>
    </Stack>
  );
};
