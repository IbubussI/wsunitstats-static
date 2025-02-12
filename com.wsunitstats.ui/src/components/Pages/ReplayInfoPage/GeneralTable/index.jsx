import * as Utils from 'utils/utils';
import {
  alpha,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme
} from "@mui/material";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import advancedFormat from 'dayjs/plugin/advancedFormat';


dayjs.extend(duration);
dayjs.extend(advancedFormat);

const GeneralTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.8)
}));

export const GeneralTable = ({ replayInfo }) => {
  const theme = useTheme();

  const match = replayInfo.match;
  const rowsLeft = [
    ["Replay code", "rep-" + match.replayCode],
    ["Mode", match.mode],
    ["Match start", Utils.formatTimeLong(match.startTime)],
    ["Duration", Utils.formatDuration(match.duration)],
    ["Victory", match.isWonderWin ? "Wonder timeout" : "Players defeated"],
  ]

  const rowsRight = [
    ["Players", match.playersCount],
    ["Region", match.region],
    ["Game version", match.gameVersion],
    ["Match initiator",  match.isMatchmaking ? "Matchmaking" : match.creator],
    ["Dev mode", match.isDevMode ? "On" : "Off"]
  ]

  return (
    <Stack direction="row" sx={{ gap: 2, paddingTop: 1, paddingBottom: 1 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {rowsLeft.map((row, id) => (
              <TableRow key={id} sx={{
                backgroundColor: alpha(theme.palette.secondary.light, '0.7'),
                '&:hover': {
                  backgroundColor: theme.palette.secondary.light
                },
              }}>
                <GeneralTableCell align="left">{row[0]}</GeneralTableCell>
                <GeneralTableCell align="right">{row[1]}</GeneralTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {rowsRight.map((row, id) => (
              <TableRow key={id} sx={{
                backgroundColor: theme.palette.secondary.light,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.secondary.light, '0.7')
                },
              }}>
                <GeneralTableCell align="left">{row[0]}</GeneralTableCell>
                <GeneralTableCell align="right">{row[1]}</GeneralTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
