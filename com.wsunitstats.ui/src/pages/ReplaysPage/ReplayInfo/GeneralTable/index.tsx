import * as React from 'react';
import * as Utils from '@/utils/utils';
import {
  Box,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  useMediaQuery
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import { NoBottomBorderRow } from '@/components/common/misc';
import { CopyText } from '@/components/common/misc';
import type { ReplayParseResult } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

const GeneralTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.8)
}));

/** One line cut with an ellipsis; the full text is in the tooltip */
const EllipsisText = ({ text, small = false }: { text: string; small?: boolean }) => (
  <Box title={text} sx={{
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: small ? '0.75rem' : undefined
  }}>
    {text}
  </Box>
);

type GeneralTableRow = [string, React.ReactNode];

const GeneralTableRows = ({ rows }: { rows: GeneralTableRow[] }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableBody>
        {rows.map(([label, value], id) => (
          <NoBottomBorderRow key={id}>
            <GeneralTableCell align="left" sx={{ whiteSpace: 'nowrap' }}>{label}</GeneralTableCell>
            {/* takes the rest of the width and never widens the table: long values are cut instead */}
            <GeneralTableCell align="right" sx={{ width: '100%', maxWidth: 0 }}>
              {typeof value === 'string' || typeof value === 'number'
                ? <EllipsisText text={String(value)} />
                : value}
            </GeneralTableCell>
          </NoBottomBorderRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export const GeneralTable = ({ replayInfo }: { replayInfo: ReplayParseResult }) => {
  const isWide = useMediaQuery('(min-width:800px)');
  const { t } = useTranslation();

  const match = replayInfo.match;
  const winType = match.isWonderWin
    ? t('replayVictoryWonder')
    : t('replayVictoryPlayers');
  const rowsLeft: GeneralTableRow[] = [
    [t('replayRepCodeCell'), <CopyText sx={{ alignItems: 'center', justifyContent: 'flex-end' }} text={"rep-" + match.replayCode} />],
    [t('replayModeCell'), t(match.mode)],
    [t('replayMatchStartCell'), Utils.formatTimeLong(match.startTime)],
    [t('replayDurationCell'), Utils.formatDuration(match.duration)],
    [t('replayVictoryCell'), match.isComplete ? winType : t('replayVictoryNotComplete')],
    [t('replayPlayersCell'), match.playersCount]
  ];

  const rowsRight: GeneralTableRow[] = [
    [t('replayRegionCell'), match.region],
    [t('replayGameVersionCell'), <EllipsisText text={match.gameVersion} small />],
    [t('replayInitiatorCell'), match.isMatchmaking ? t('replayInitiatorMatchmaking') : match.creator],
    [t('replayMapCodeCell'), !match.isMapGen && match.isMapReleased ? `map-${match.mapCode}` : '-'],
    [t('replayMapSymmetryCell'), t(match.mapSymmetry)],
    [t('replayDevModeCell'), match.isDevMode ? t('conditionOn') : t('conditionOff')]
  ];

  return (
    <Stack direction={isWide ? 'row' : 'column'} gap={1}>
      <GeneralTableRows rows={rowsLeft} />
      <GeneralTableRows rows={rowsRight} />
    </Stack>
  );
};
