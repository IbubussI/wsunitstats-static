import * as React from 'react';
import * as Utils from 'utils/utils';
import * as Constants from 'utils/constants';
import {
  alpha,
  Box,
  Chip,
  chipClasses,
  Container,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField
} from '@mui/material';
import { FormButton } from 'components/Atoms/FormButton';
import { ReplayInfoParser } from 'components/Pages/ReplayInfoPage/replayInfoParser';
import { useValuesToQueryStringSync } from 'components/Hooks/useValuesToQueryStringSync';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { WinnerIcon } from './svg';
import { TagChip } from 'components/Atoms/TagChip';
import { useTheme } from '@emotion/react';
import { Image } from 'components/Atoms/Renderer';

// enable durations plugin
dayjs.extend(duration);

const PlayerIdChip = styled(Chip)(({ label }) => ({
  height: '22px',
  fontSize: '0.55rem',
  fontWeight: 'bold',
  [`& .${chipClasses.label}`]: {
    width: '22px',
    position: 'relative',
    paddingLeft: 'inherit',
    paddingRight: 'inherit',
    zIndex: 0,
    '&::before': {
      content: `"${label}"`,
      WebkitTextStroke: '2px white',
      position: 'absolute',
      paddingLeft: 'inherit',
      paddingRight: 'inherit',
      width: '22px',
      left: 0,
      top: 0,
      zIndex: -1,
    }
  },
}));

const PlayerTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.7rem',
  padding: theme.spacing(0.6)
}));

const RatingTag = styled(TagChip)(() => ({
  '& span': {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingRight: '8px',
    paddingLeft: '8px',
  }
}));

const FormContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: 0.5,
  width: '100%',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  justifyContent: 'center'
}));

export const ReplayInfoPage = () => {
  const { localizedResearches, localizedUnits } = useOutletContext();
  const { sync } = useValuesToQueryStringSync();
  const [searchParams] = useSearchParams();
  const [replayCodeInput, setReplayCodeInput] = React.useState('');
  const [replayInfo, setReplayInfo] = React.useState('');

  React.useEffect(() => {
    const replayCodeParam = searchParams.get(Constants.PARAM_REPLAY_CODE);
    const replayCode = parseReplayCode(replayCodeParam);
    if (replayCode) {
      setReplayCodeInput(replayCode);
      Utils.fetchJson(Constants.WS_GAMES_API_REPLAY_BY_CODE + replayCode,
        (responseJson) => {
          const parser = new ReplayInfoParser(localizedResearches);
          setReplayInfo(parser.parse(responseJson));
        },
        (errorResponse) => {
          setReplayInfo({ error: 255, message: errorResponse.message ? errorResponse.message : errorResponse })
        }
      );
    } else if (replayCodeParam) {
      setReplayInfo({ error: 255, message: "Submitted replay code is not valid."})
    }
  }, [searchParams, localizedResearches]);

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
            setReplayInfo({ error: 255, message: "Submitted replay code is not valid."})
          }
        }}
        onInputChange={(event) => setReplayCodeInput(event.target.value)}
        inputValue={replayCodeInput} />
      {isSuccess
        ? <PlayerTable replayInfo={replayInfo} defaultAgeImage={localizedUnits[0].image}/>
        : replayInfo && <ErrorViewer errorData={replayInfo}/>}
    </Container>
  );
};

const ReplayForm = ({ onSubmit, onInputChange, inputValue}) => {
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

const PlayerTable = ({ replayInfo, defaultAgeImage }) => {
  return (
    <TableContainer component={Paper} >
      <Table>
        <TableBody>
          {replayInfo.teams.filter(team => team.isPlayerTeam).map((team) => {
            return team.players.map((playerId) => {
              const player = replayInfo.players[playerId];
              const lastAgeResearch = player.lastAgeResearch
                ? player.lastAgeResearch.researchContext.image
                : defaultAgeImage // take altar in case there are no units
              return (
                <TableRow key={player.id} sx={{
                  backgroundColor: team.color,
                  '&:hover': {
                    backgroundColor: alpha(team.color, '0.8')
                  },
                }}>
                  <PlayerTableCell align="center" sx={{ width: '41px' }}>
                    <PlayerIdChip label={player.id} sx={{ backgroundColor: player.color }} />
                  </PlayerTableCell>
                  <PlayerTableCell align="left" sx={{ width: 'auto' }}>
                    <Box sx={{
                        maxWidth: '250px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}>
                      {player.nickname}
                    </Box>
                  </PlayerTableCell>
                  <PlayerTableCell align="right" sx={{ width: '80px' }}>{player.group && `Group-${player.group}`}</PlayerTableCell>
                  <PlayerTableCell align="right" sx={{ width: '60px', lineHeight: 0, paddingTop: 0, paddingBottom: 0 }}>
                    <Image path={lastAgeResearch}
                      width={25}
                      height={25} />
                  </PlayerTableCell>
                  <PlayerTableCell align="right" sx={{ width: '80px' }}>{player.isDead && getSurvivalTimeString(player.survivalTime)}</PlayerTableCell>
                  <PlayerTableCell align="center" sx={{ width: '18px', paddingRight: 0, paddingLeft: 0 }}>
                    {player.isDead &&
                      <i className="fa-solid fa-skull fa-lg" style={{ color: '#dd1d1dd4' }}></i>}
                    {player.isWinner &&
                      <WinnerIcon sx={{ width: '20px', height: '20px', display: 'block' }} />}
                  </PlayerTableCell>
                  <PlayerTableCell align="right" sx={{ width: '30px', lineHeight: 0 }}>
                    {player.isWonderBuilt && player.isWonderWin && <Image path={"/static/wonder_active.png"}
                      width={18}
                      height={18}
                      isStatic={true} />}
                    {player.isWonderBuilt && !player.isWonderWin && <Image path={"/static/wonder_inactive.png"}
                      width={18}
                      height={18}
                      isStatic={true} />}
                  </PlayerTableCell>
                  <PlayerTableCell align="right" sx={{ maxWidth: '100%', width: '100px' }}>
                    <RatingTag label={player.rating} />
                  </PlayerTableCell>
                </TableRow>
              );
            });
          })}
        </TableBody>
      </Table>
    </TableContainer>
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

function getSurvivalTimeString(survTime) {
  return dayjs.duration(survTime).format('HH:mm:ss').replace("00:", "");
}
