import * as React from 'react';
import {
  alpha,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Tooltip,
  type Theme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SingleSelect } from '@/components/common/SingleSelect';
import { Image } from '@/components/common/Image';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { SwordsIcon } from '@/components/common/materialSymbols';
import { DeadIcon } from '@/pages/ReplaysPage/ReplayInfo/svg';
import { ColoredTableRow } from '@/pages/ReplaysPage/ReplayInfo/PlayerTable';
import { countAllUnits } from '@/pages/ReplaysPage/PlayerInfo/UnitsInfo/unitsInfo';
import type { Player, ReplayParseResult, Team } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import type { ReplayExtraData } from '@/pages/ReplaysPage/ReplayInfo/replayAnalyzer';

/** Chart with the running totals of collected resources (food, wood, iron) */
const COLLECTED_CONTAINER_NAME = 'replayDatasetResourcesCollectedName';
/** Icons of food, wood and iron */
export const RESOURCE_IMAGES = ['resource/0.png', 'resource/1.png', 'resource/2.png'];
/** Food, wood and iron: the resources the table counts (resource ids) */
const RESOURCE_IDS = [0, 1, 2];
/**
 * Fixed widths of the stats columns, so they do not move when the group changes; the name takes the rest.
 * A resource column fits a team total of 7 digits with the icon
 */
const RESOURCE_WIDTH = 100;
const UNITS_WIDTH = 76;
/** Resource lines in a cell: as tight as the text, so a row with them stays low */
const RESOURCE_ICON_SIZE = 13;
const RESOURCE_LINE_HEIGHT = '14px';
const RESOURCE_LINE_GAP = '1px';
const UNITS_ICON_SIZE = 15;
/** Minimal width of the name column: the table scrolls horizontally instead of squeezing it further */
const NAME_MIN_WIDTH = 110;
/** Padding at the table edges: keeps the first and the last column a bit away from them */
const EDGE_PADDING = '12px';

type GroupId = 'teams' | 'squads' | 'players';
const GROUPS: { id: GroupId; name: string }[] = [
  { id: 'teams', name: 'replayDatasetGroupTeams' },
  { id: 'squads', name: 'replayDatasetGroupSquads' },
  { id: 'players', name: 'replayDatasetGroupPlayers' }
];

/**
 * Totals of a player, team or squad, resources by resource id; shared and received are absent without the resource
 * transfers, units if the replay has no units data
 */
interface Stats {
  collected: number[];
  shared?: number[];
  received?: number[];
  units?: { created: number; killed: number; lost: number };
}

/**
 * Stats column: resource amounts (food, wood and iron in lines of the cell, each with its icon) or a units count
 */
interface Column {
  label: string;
  tooltip: string;
  width: number;
  resources?: (stats: Stats) => number[] | undefined;
  value?: (stats: Stats) => number | undefined;
  /** Shown only with the resource transfers */
  isTransfer?: boolean;
  /** Icon after a units count, sized by the font size */
  icon?: React.ReactNode;
}

interface ColumnGroup {
  label: string;
  tooltip: string;
  columns: Column[];
}

/** Resources collected, sent to and received from other players, units created, killed and lost */
const COLUMN_GROUPS: ColumnGroup[] = [
  {
    label: 'replayStatsResourcesHeader', tooltip: 'replayStatsResourcesTooltip', columns: [
      { label: 'replayStatsCollectedHeader', tooltip: 'replayStatsCollectedTooltip', width: RESOURCE_WIDTH, resources: stats => stats.collected },
      { label: 'replayStatsSentHeader', tooltip: 'replayStatsSentTooltip', width: RESOURCE_WIDTH, resources: stats => stats.shared, isTransfer: true },
      { label: 'replayStatsReceivedHeader', tooltip: 'replayStatsReceivedTooltip', width: RESOURCE_WIDTH, resources: stats => stats.received, isTransfer: true }
    ]
  },
  {
    label: 'replayStatsUnitsHeader', tooltip: 'replayStatsUnitsTooltip', columns: [
      { label: 'replayStatsCreatedHeader', tooltip: 'replayStatsCreatedTooltip', width: UNITS_WIDTH, value: stats => stats.units?.created, icon: <AddCircleIcon fontSize='inherit' /> },
      { label: 'replayStatsKilledHeader', tooltip: 'replayStatsKilledTooltip', width: UNITS_WIDTH, value: stats => stats.units?.killed, icon: <SwordsIcon fontSize='inherit' /> },
      // the skull of the player table (dead players)
      { label: 'replayStatsLostHeader', tooltip: 'replayStatsLostTooltip', width: UNITS_WIDTH, value: stats => stats.units?.lost, icon: <DeadIcon size='1x' /> }
    ]
  }
];

const borderColor = (theme: Theme) => alpha(theme.palette.grey[700], 0.6);

const StatsTableCell = styled(TableCell)(({ theme }) => ({
  borderColor: borderColor(theme),
  fontSize: '0.8125rem',
  fontVariantNumeric: 'tabular-nums',
  padding: theme.spacing(0.375, 0.5),
  whiteSpace: 'nowrap'
}));

const StatsTableHeaderCell = styled(TableCell)(({ theme }) => ({
  borderColor: borderColor(theme),
  fontSize: '0.8125rem',
  padding: theme.spacing(0.5, 0.5),
  whiteSpace: 'nowrap',
  lineHeight: '1rem',
  color: theme.palette.grey[700]
}));

/** Separates the column groups: on the first column of each group */
const groupStartSx = { borderLeft: (theme: Theme) => `1px solid ${borderColor(theme)}` };

interface StatsRow {
  name: string;
  teamColor: Team['color'];
  stats: Stats;
}

/**
 * Collected resources (food, wood, iron) of each player by player index: the collected values are running totals,
 * so the largest one is the total
 */
export const getPlayerResources = (timeLine: ReplayParseResult['timeLine']): number[][] => {
  const container = timeLine?.find((item: { containerName: string }) => item.containerName === COLLECTED_CONTAINER_NAME);
  const players = container?.datasetGroups.find((group: { dataGroupIdentifier: string }) => group.dataGroupIdentifier === 'players');
  return (players?.datasets ?? []).map((dataset: { values: (number | undefined)[][] }) =>
    dataset.values.map(row => row.reduce<number>((max, value) => value != null && value > max ? value : max, 0)));
};

/** Resources each player sent to (shared) and received from other players by player index; received is after the tax */
export interface Transfers {
  shared: Map<number, number[]>;
  received: Map<number, number[]>;
}

const noResources = () => RESOURCE_IDS.map(() => 0);

export const getTransfers = (extraData: ReplayExtraData): Transfers => {
  const shared = new Map<number, number[]>();
  const received = new Map<number, number[]>();
  const add = (map: Map<number, number[]>, playerId: number, amounts: number[], k: number) => {
    const total = map.get(playerId) ?? noResources();
    RESOURCE_IDS.forEach(resourceId => total[resourceId] += (amounts[resourceId] ?? 0) * k);
    map.set(playerId, total);
  };
  extraData.resourceTransfers.forEach(transfer => {
    add(shared, transfer.senderId, transfer.amounts, 1);
    add(received, transfer.receiverId, transfer.amounts, transfer.receivedPercent / 100);
  });
  return { shared, received };
};

const getPlayerStats = (player: Player, collected?: number[], transfers?: Transfers): Stats => ({
  collected: collected ?? noResources(),
  shared: transfers && (transfers.shared.get(player.id) ?? noResources()),
  received: transfers && (transfers.received.get(player.id) ?? noResources()),
  units: player.unitsCreatedOn && player.unitsKilledOn && player.unitsLostOn
    ? {
      created: countAllUnits(player.unitsCreated),
      killed: countAllUnits(player.unitsKilledPlain),
      lost: countAllUnits(player.unitsLostPlain)
    }
    : undefined
});

/** Sums of the amounts by resource id of several players; absent if any is absent */
const sumResources = (amounts: (number[] | undefined)[]) => amounts.every(item => item)
  ? RESOURCE_IDS.map(resourceId => amounts.reduce((sum, item) => sum + item![resourceId], 0))
  : undefined;

/** Sum of the stats of several players */
const sumStats = (stats: Stats[]): Stats => ({
  collected: sumResources(stats.map(item => item.collected))!,
  shared: sumResources(stats.map(item => item.shared)),
  received: sumResources(stats.map(item => item.received)),
  units: stats.every(item => item.units)
    ? {
      created: stats.reduce((sum, item) => sum + item.units!.created, 0),
      killed: stats.reduce((sum, item) => sum + item.units!.killed, 0),
      lost: stats.reduce((sum, item) => sum + item.units!.lost, 0)
    }
    : undefined
});

/**
 * Resources collected, shared and received (food, wood and iron each) and units created, killed and lost
 * by teams, squads or players
 * @param extraData additional replay data: the shared and received columns are shown only with it
 */
export const StatsTable = ({ replayInfo, extraData }: { replayInfo: ReplayParseResult; extraData: ReplayExtraData | null }) => {
  const { t, i18n } = useTranslation();
  const [groupId, setGroupId] = React.useState<GroupId>('teams');
  const columnGroups = COLUMN_GROUPS.map(group => ({ ...group, columns: group.columns.filter(column => extraData || !column.isTransfer) }));
  const columns = columnGroups.flatMap(group => group.columns.map((column, index) => ({ column, isGroupStart: index === 0 })));
  // the fixed layout ignores the min width of cells, so the name column is limited through the table width
  const tableMinWidth = NAME_MIN_WIDTH + columns.reduce((sum, { column }) => sum + column.width, 0);
  const isLastColumn = (index: number) => index === columns.length - 1;

  const rowsByGroup = React.useMemo(() => {
    const playerResources = getPlayerResources(replayInfo.timeLine);
    const transfers = extraData ? getTransfers(extraData) : undefined;
    const teams: Team[] = replayInfo.teams.filter((team: Team) => team.isPlayerTeam);
    const playerStats = (playerId: number) => getPlayerStats(replayInfo.players[playerId], playerResources[playerId], transfers);
    const teamOf = (playerId: number) => teams.find(team => team.players.includes(playerId))!;

    const players: StatsRow[] = teams.flatMap(team => team.players.map((playerId: number) => ({
      name: replayInfo.players[playerId].nickname,
      teamColor: team.color,
      stats: playerStats(playerId)
    })));
    // named in order of the teams with players, the same as in charts
    const teamRows: StatsRow[] = teams.map((team, index) => ({
      name: t('replayTeam', { value: index + 1 }),
      teamColor: team.color,
      stats: sumStats(team.players.map(playerStats))
    }));
    const squadMembers = new Map<number, number[]>();
    teams.flatMap(team => team.players).forEach((playerId: number) => {
      const squad = replayInfo.players[playerId].group;
      if (squad != null) {
        squadMembers.set(squad, [...(squadMembers.get(squad) ?? []), playerId]);
      }
    });
    const squads: StatsRow[] = [...squadMembers.entries()]
      .sort(([first], [second]) => first - second)
      .map(([squad, members]) => ({
        name: t('replaySquad', { value: squad + 1 }),
        teamColor: teamOf(members[0]).color,
        stats: sumStats(members.map(playerStats))
      }));
    return { teams: teamRows, squads, players } as Record<GroupId, StatsRow[]>;
  }, [replayInfo, extraData, t]);

  const groupOptions = GROUPS.filter(group => rowsByGroup[group.id].length > 0)
    .map(group => ({ id: group.id, name: t(group.name) }));
  const currentGroup = groupOptions.find(option => option.id === groupId) ?? groupOptions[0];
  const rows = rowsByGroup[currentGroup?.id] ?? [];
  const formatValue = (value?: number) => value != null ? Math.round(value).toLocaleString(i18n.language) : '-';
  // only the resources with an amount (most players share nothing), "-" if none has
  const resourceLines = (amounts?: number[]) => {
    const resourceIds = RESOURCE_IDS.filter(resourceId => amounts && Math.round(amounts[resourceId]) !== 0);
    return amounts && resourceIds.length > 0
      ? <Stack alignItems='flex-end' sx={{ lineHeight: RESOURCE_LINE_HEIGHT, gap: RESOURCE_LINE_GAP }}>
        {resourceIds.map(resourceId =>
          <Stack key={resourceId} direction='row' alignItems='center' gap={0.5} height={RESOURCE_LINE_HEIGHT}>
            <span>{formatValue(amounts[resourceId])}</span>
            <Image path={RESOURCE_IMAGES[resourceId]} width={RESOURCE_ICON_SIZE} height={RESOURCE_ICON_SIZE} />
          </Stack>)}
      </Stack>
      : '-';
  };
  const unitsCount = (column: Column, stats: Stats) => {
    const value = column.value?.(stats);
    return value != null && column.icon
      ? <Stack direction='row' alignItems='center' justifyContent='flex-end' gap={0.5}>
        <span>{formatValue(value)}</span>
        {/* the icons take the size and the color from here */}
        <Box component='span' sx={{ display: 'inline-flex', fontSize: UNITS_ICON_SIZE, color: 'text.secondary' }}>
          {column.icon}
        </Box>
      </Stack>
      : formatValue(value);
  };

  return (
    <Stack gap={1}>
      {groupOptions.length > 1 && <SingleSelect
        sx={{ width: 240 }}
        size='small'
        label={t('chartBoxDatasetGroupSelectLabel')}
        value={currentGroup ?? null}
        options={groupOptions}
        onChange={(option) => setGroupId(option.id)}
      />}
      <TableContainer component={Paper}>
        <Table sx={{ tableLayout: 'fixed', width: '100%', minWidth: tableMinWidth }}>
          {/* the fixed layout takes the widths from the first row, which has the column groups: set them here instead;
              the name column takes the rest */}
          <colgroup>
            <col />
            {columns.map(({ column }) => <col key={column.label} style={{ width: column.width }} />)}
          </colgroup>
          <TableHead>
            {/* column groups, then the columns */}
            <TableRow>
              <StatsTableHeaderCell rowSpan={2} sx={{ paddingLeft: EDGE_PADDING, verticalAlign: 'bottom' }}>
                {currentGroup && t(GROUPS.find(group => group.id === currentGroup.id)!.name)}
              </StatsTableHeaderCell>
              {columnGroups.map(group =>
                <StatsTableHeaderCell key={group.label} colSpan={group.columns.length} align='center' sx={groupStartSx}>
                  <HeaderLabel label={t(group.label)} tooltip={t(group.tooltip)} />
                </StatsTableHeaderCell>)}
            </TableRow>
            <TableRow>
              {columns.map(({ column, isGroupStart }, index) =>
                <StatsTableHeaderCell key={column.label} align='right' sx={[
                  isGroupStart && groupStartSx,
                  isLastColumn(index) && { paddingRight: EDGE_PADDING }
                ]}>
                  <HeaderLabel label={t(column.label)} tooltip={t(column.tooltip)} />
                </StatsTableHeaderCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) =>
              <ColoredTableRow key={rowIndex} teamColor={row.teamColor}>
                <StatsTableCell sx={{ paddingLeft: EDGE_PADDING, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.name}
                </StatsTableCell>
                {columns.map(({ column, isGroupStart }, index) =>
                  <StatsTableCell key={column.label} align='right' sx={[
                    isGroupStart && groupStartSx,
                    isLastColumn(index) && { paddingRight: EDGE_PADDING }
                  ]}>
                    {column.resources ? resourceLines(column.resources(row.stats)) : unitsCount(column, row.stats)}
                  </StatsTableCell>)}
              </ColoredTableRow>)}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

/** Column header text with a tooltip explaining the column */
const HeaderLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Tooltip arrow title={tooltip}>
    <span style={{ cursor: 'help' }}>{label}</span>
  </Tooltip>
);
