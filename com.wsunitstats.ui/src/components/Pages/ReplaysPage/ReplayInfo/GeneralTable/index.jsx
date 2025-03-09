import * as Utils from 'utils/utils';
import {
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import { NoBottomBorderRow } from 'components/Atoms/Table';
import { CopyText } from 'components/Atoms/CopyText';

const GeneralTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.8)
}));

export const GeneralTable = ({ replayInfo }) => {
  const { t } = useTranslation();

  const match = replayInfo.match;
  const winType = match.isWonderWin
    ? t('replayVictoryWonder')
    : t('replayVictoryPlayers');
  const rowsLeft = [
    [t('replayRepCodeCell'), <CopyText sx={{ alignItems: 'center', justifyContent: 'flex-end' }} text={"rep-" + match.replayCode} />],
    [t('replayModeCell'), t(match.mode)],
    [t('replayMatchStartCell'), Utils.formatTimeLong(match.startTime)],
    [t('replayDurationCell'), Utils.formatDuration(match.duration)],
    [t('replayVictoryCell'), match.isComplete ? winType : t('replayVictoryNotComplete')],
    [t('replayPlayersCell'), match.playersCount]
  ];

  const rowsRight = [
    [t('replayRegionCell'), match.region],
    [t('replayGameVersionCell'), match.gameVersion],
    [t('replayInitiatorCell'), match.isMatchmaking ? t('replayInitiatorMatchmaking') : match.creator],
    [t('replayMapCodeCell'), !match.isMapGen && match.isMapReleased ? `map-${match.mapCode}` : '-'],
    [t('replayMapSymmetryCell'), t(match.mapSymmetry)],
    [t('replayDevModeCell'), match.isDevMode ? t('conditionOn') : t('conditionOff')]
  ];

  return (
    <Stack direction="row" gap={1}>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {rowsLeft.map((row, id) => (
              <NoBottomBorderRow key={id}>
                <GeneralTableCell align="left">{row[0]}</GeneralTableCell>
                <GeneralTableCell align="right">{row[1]}</GeneralTableCell>
              </NoBottomBorderRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {rowsRight.map((row, id) => (
              <NoBottomBorderRow key={id}>
                <GeneralTableCell align="left">{row[0]}</GeneralTableCell>
                <GeneralTableCell align="right">{row[1]}</GeneralTableCell>
              </NoBottomBorderRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
