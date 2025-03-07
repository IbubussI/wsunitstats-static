import * as React from 'react';
import * as Utils from 'utils/utils';
import * as Constants from 'utils/constants';
import {
  Box,
  Container,
  Paper,
  Stack,
  styled,
  TextField,
  useTheme
} from '@mui/material';
import { FormButton } from 'components/Atoms/FormButton';
import { ReplayInfoParser } from 'components/Pages/ReplaysPage/ReplayInfo/replayInfoParser';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { GameDataContext } from 'gameDataContext';

const FormContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: 0.5,
  width: '100%',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  justifyContent: 'center'
}));

export const ReplayPage = () => {
  const gameContext = useContext(GameDataContext);
  const navigate = useNavigate();
  const params = useParams();
  const [replayCodeInput, setReplayCodeInput] = React.useState('');
  const [replayInfo, setReplayInfo] = React.useState({});

  const openReplay = (replayCode) => {
    navigate(Utils.getUrlWithPathParams([
      { param: replayCode, pos: 3 },
      { param: Constants.REPLAY_INFO_PAGE_PATH, pos: 4 }
    ], false, 5), { replace: false });
  };

  const clear = () => {
    navigate(Utils.getUrlWithPathParams([], false, 3), { replace: true });
  };

  React.useEffect(() => {
    const replayCodeParam = params.replayCode;
    const replayCode = parseReplayCode(replayCodeParam);
    if (replayCode) {
      setReplayCodeInput(replayCode);
      Utils.fetchJson(Constants.WS_GAMES_API_REPLAY_BY_CODE + replayCode,
        (responseJson) => {
          const parser = new ReplayInfoParser(gameContext, replayCode);
          setReplayInfo(parser.parse(responseJson));
        },
        (errorResponse) => {
          setReplayInfo({ error: 255, message: errorResponse.message ? errorResponse.message : errorResponse });
        }
      );
    } else if (replayCodeParam) {
      setReplayInfo({ error: 255, message: "Submitted replay code is not valid." });
    }
  }, [params.replayCode, gameContext]);

  const isSuccess = replayInfo && replayInfo.error === 0;
  return (
    <Container maxWidth="md" component={Paper} sx={{ my: 4, p: '24px' }}>
      <ReplayForm
        onSubmit={(event) => {
          // prevent page reload
          event.preventDefault();
          const replayCode = parseReplayCode(replayCodeInput.trim());
          if (replayCode) {
            setReplayCodeInput(replayCode);
            openReplay(replayCode);
          } else if (replayCodeInput) {
            setReplayInfo({ error: 255, message: "Submitted replay code is not valid." });
            clear();
          }
        }}
        onInputChange={(event) => setReplayCodeInput(event.target.value)}
        inputValue={replayCodeInput} />

      {isSuccess
        ? <Outlet context={replayInfo} />
        : <ErrorViewer errorData={replayInfo} />}
    </Container>
  );
};

const ReplayForm = ({ onSubmit, onInputChange, inputValue }) => {
  const { t } = useTranslation();
  return (
    <FormContainer component='form'
      onSubmit={onSubmit} >
      <TextField
        label={t('replayFormLabel')}
        variant="standard"
        value={inputValue}
        onChange={onInputChange} />
      <FormButton type='submit'>
        {t('replayFormLoad')}
      </FormButton>
    </FormContainer>
  );
};

const ErrorViewer = ({ errorData }) => {
  const theme = useTheme();

  if (errorData) {
    return (
      <Box sx={{
        textAlign: 'center',
        color: theme.palette.error.main,
        wordWrap: "break-word"
      }}>
        {errorData.message}
      </Box>
    );
  } else {
    return null;
  }
};

function parseReplayCode(input) {
  if (!input) {
    return;
  }

  const regexp = /^(?:rep-)?(.{11})$/;
  const match = input.match(regexp);
  return match ? match[1] : undefined;
}
