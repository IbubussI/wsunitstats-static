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

export const PlayerInfo = () => {
  const { t } = useTranslation();
  const replayInfo = useOutletContext();
  const params = useParams();

  const player = replayInfo.players[params.player];
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
      <Box>
        <Typography variant="h6">
          {t('playerInfoUnitsCreatedTitle')}
        </Typography>
        <UnitsInfo player={player} />
      </Box>
    </Stack>
  );
};
