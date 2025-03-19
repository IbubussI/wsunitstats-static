import * as Utils from 'utils/utils';
import * as Constants from 'utils/constants';
import {
  Box,
  Button,
  Stack,
  Typography
} from '@mui/material';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { UnitsInfo } from './UnitsInfo';
import { useTranslation } from 'react-i18next';
import { GeneralTable } from './GeneralTable';
import { PlayerChartViewer } from './PlayerChartViewer';

export const PlayerInfo = () => {
  const { t } = useTranslation();
  const replayInfo = useOutletContext();
  const params = useParams();

  const playerIndex = Number(params.player);
  const player = replayInfo.players[playerIndex];
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
      <GeneralTable player={player} />
      {player.unitsCreated &&
        <Box>
          <Typography variant="h5" gutterBottom>
            {t('playerInfoUnitsCreatedTitle')}
          </Typography>
          <UnitsInfo unitsCreated={player.unitsCreated} />
        </Box>}
      {replayInfo.timeLine &&
        <Box>
          <Typography variant="h5" gutterBottom>
            {t('playerInfoChartsTitle')}
          </Typography>
          <PlayerChartViewer charts={replayInfo.timeLine.charts} timeLinePeriod={replayInfo.timeLinePeriod} playerId={playerIndex} />
        </Box>}
    </Stack>
  );
};
