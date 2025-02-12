import * as React from 'react';
import * as Utils from 'utils/utils';
import * as Constants from 'utils/constants';
import {
  Box,
  Container,
  Stack,
  styled,
  TextField,
  useTheme
} from '@mui/material';
import { FormButton } from 'components/Atoms/FormButton';
import { ReplayInfoParser } from 'components/Pages/ReplayInfoPage/replayInfoParser';
import { useValuesToQueryStringSync } from 'components/Hooks/useValuesToQueryStringSync';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { PlayerTable } from 'components/Pages/ReplayInfoPage/PlayerTable';
import { GeneralTable } from 'components/Pages/ReplayInfoPage/GeneralTable';

const FormContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: 0.5,
  width: '100%',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  justifyContent: 'center'
}));

export const ReplayInfoPage = () => {
  const context = useOutletContext();
  const { sync, clear } = useValuesToQueryStringSync();
  const [searchParams] = useSearchParams();
  const [replayCodeInput, setReplayCodeInput] = React.useState('');
  const [replayInfo, setReplayInfo] = React.useState({});

  React.useEffect(() => {
    const replayCodeParam = searchParams.get(Constants.PARAM_REPLAY_CODE);
    const replayCode = parseReplayCode(replayCodeParam);
    if (replayCode) {
      setReplayCodeInput(replayCode);
      Utils.fetchJson(Constants.WS_GAMES_API_REPLAY_BY_CODE + replayCode,
        (responseJson) => {
          const parser = new ReplayInfoParser(context, replayCode);
          setReplayInfo(parser.parse(responseJson));
        },
        (errorResponse) => {
          setReplayInfo({ error: 255, message: errorResponse.message ? errorResponse.message : errorResponse });
        }
      );
    } else if (replayCodeParam) {
      setReplayInfo({ error: 255, message: "Submitted replay code is not valid." });
    }
  }, [searchParams, context]);

  const isSuccess = replayInfo && replayInfo.error === 0;
  return (
    <Container maxWidth="md">
      <ReplayForm
        onSubmit={(event) => {
          // prevent page reload
          event.preventDefault();
          const replayCode = parseReplayCode(replayCodeInput);
          if (replayCode) {
            setReplayCodeInput(replayCode);
            const map = new Map();
            map.set(Constants.PARAM_REPLAY_CODE, [replayCode]);
            sync(map);
          } else if (replayCodeInput) {
            setReplayInfo({ error: 255, message: "Submitted replay code is not valid." });
            clear([Constants.PARAM_REPLAY_CODE]);
          }
        }}
        onInputChange={(event) => setReplayCodeInput(event.target.value)}
        inputValue={replayCodeInput} />
      {isSuccess ?
        <>
          <GeneralTable replayInfo={replayInfo} />
          <PlayerTable replayInfo={replayInfo} />
        </>
        : replayInfo && <ErrorViewer errorData={replayInfo} />}
    </Container>
  );
};

const ReplayForm = ({ onSubmit, onInputChange, inputValue }) => {
  return (
    <FormContainer component='form'
      onSubmit={onSubmit} >
      <TextField
        label="Enter replay code"
        variant="standard"
        value={inputValue}
        onChange={onInputChange} />
      <FormButton type='submit'>
        LOAD
      </FormButton>
    </FormContainer>
  );
};

const ErrorViewer = ({ errorData }) => {
  const theme = useTheme();

  return (
    <Box sx={{
      textAlign: 'center',
      color: theme.palette.error.main,
      wordWrap: "break-word"
    }}>
      {errorData.message}
    </Box>
  );
};

function parseReplayCode(input) {
  if (!input) {
    return;
  }

  const regexp = /^(?:rep-)?(.{11})$/;
  const match = input.match(regexp);
  return match ? match[1] : undefined;
}
