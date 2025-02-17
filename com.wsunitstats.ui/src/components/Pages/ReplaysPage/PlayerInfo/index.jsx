import * as Utils from 'utils/utils';
import * as Constants from 'utils/constants';
import {
  Box,
  Button,
  Typography
} from '@mui/material';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

export const PlayerInfo = () => {
  const replayInfo = useOutletContext();
  const params = useParams();
  const navigate = useNavigate();

  const navBack = () => {
    navigate(Utils.getUrlWithPathParams([{ param: Constants.REPLAY_INFO_PAGE_PATH, pos: 4 }], true, 5), { replace: false });
  };

  return (
    <Box>
      <Button variant="contained" onClick={navBack}>
        <ArrowBackTwoToneIcon />
      </Button>
      <Typography>
        name: {replayInfo.players[params.player].nickname}
      </Typography>
      <Typography>
        Content will be SOON
      </Typography>
    </Box>
  );
};