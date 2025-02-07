import * as React from 'react';
import * as Utils from 'utils/utils';
import * as Constants from 'utils/constants';
import { Box, TextField } from '@mui/material';
import { FormButton } from 'components/Atoms/FormButton';

export const ReplaysPage = () => {
  const [replayCode, setReplayCode] = React.useState('');
  const [replayInfo, setReplayInfo] = React.useState('');

  return (
    <>
      <TextField
        label="Enter replay code"
        variant="standard"
        value={replayCode}
        onChange={(event) => setReplayCode(event.target.value)} />
      <FormButton
        onClick={() => Utils.fetchJson(Constants.WS_GAMES_API_REPALY_BY_CODE + replayCode, (responseJson) => setReplayInfo(responseJson))}
      >
        SEARCH
      </FormButton>
      <Box>
        {JSON.stringify(replayInfo)}
      </Box>
    </>
  );
}