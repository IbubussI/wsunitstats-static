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
  Tooltip,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SingleSelect } from '@/components/common/SingleSelect';
import { Image } from '@/components/common/Image';
import { ColoredTableRow } from '@/pages/ReplaysPage/ReplayInfo/PlayerTable';
import { countAllUnits } from '@/pages/ReplaysPage/PlayerInfo/UnitsInfo/unitsInfo';
import type { Player, ReplayParseResult, Team } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

/** Chart with the running totals of collected resources (food, wood, iron) */
const COLLECTED_CONTAINER_NAME = 'replayDatasetResourcesCollectedName';
/** Icons of food, wood and iron */
export const RESOURCE_IMAGES = ['resource/0.png', 'resource/1.png', 'resource/2.png'];
/** Fixed widths of the stats columns, so they do not move when the group changes; the name takes the rest */
const RESOURCE_WIDTH = 110;
const UNITS_WIDTH = 85;
/** Minimal width of the name column: the table scrolls horizontally instead of squeezing it further */
const NAME_MIN_WIDTH = 120;
/** Padding at the table edges: keeps the first and the last column a bit away from them */
const EDGE_PADDING = '12px';
const isLastColumn = (index: number) => index === COLUMNS.length - 1;

/** Stats columns: food, wood and iron collected, units created, killed and lost */
const COLUMNS: { label: string; tooltip: string; width: number; value: (stats: Stats) => number | undefined; image?: string }[] = [
  { label: 'replayStatsFoodHeader', tooltip: 'replayStatsFoodTooltip', width: RESOURCE_WIDTH, value: stats => stats.resources[0], image: RESOURCE_IMAGES[0] },
  { label: 'replayStatsWoodHeader', tooltip: 'replayStatsWoodTooltip', width: RESOURCE_WIDTH, value: stats => stats.resources[1], image: RESOURCE_IMAGES[1] },
  { label: 'replayStatsIronHeader', tooltip: 'replayStatsIronTooltip', width: RESOURCE_WIDTH, value: stats => stats.resources[2], image: RESOURCE_IMAGES[2] },
  { label: 'replayStatsCreatedHeader', tooltip: 'replayStatsCreatedTooltip', width: UNITS_WIDTH, value: stats => stats.units?.created },
  { label: 'replayStatsKilledHeader', tooltip: 'replayStatsKilledTooltip', width: UNITS_WIDTH, value: stats => stats.units?.killed },
  { label: 'replayStatsLostHeader', tooltip: 'replayStatsLostTooltip', width: UNITS_WIDTH, value: stats => stats.units?.lost }
];
/** The fixed layout ignores the min width of cells, so the name column is limited through the table width */
const TABLE_MIN_WIDTH = NAME_MIN_WIDTH + COLUMNS.reduce((sum, column) => sum + column.width, 0);

type GroupId = 'teams' | 'squads' | 'players';
const GROUPS: { id: GroupId; name: string }[] = [
  { id: 'teams', name: 'replayDatasetGroupTeams' },
  { id: 'squads', name: 'replayDatasetGroupSquads' },
  { id: 'players', name: 'replayDatasetGroupPlayers' }
];

const StatsTableCell = styled(TableCell)(({ theme }) => ({
  borderColor: alpha(theme.palette.grey[700], 0.6),
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.8)
}));

// the column names are 2 lines, split by a line break in the localization
const StatsTableHeaderCell = styled(TableCell)(({ theme }) => ({
  borderColor: alpha(theme.palette.grey[700], 0.6),
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.6),
  lineHeight: '1rem',
  whiteSpace: 'pre-line',
  color: theme.palette.grey[700]
}));

/** Totals of a player, team or squad; units are absent if the replay has no units data */
interface Stats {
  resources: number[];
  units?: { created: number; killed: number; lost: number };
}

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

const getPlayerStats = (player: Player, resources?: number[]): Stats => ({
  resources: resources ?? [0, 0, 0],
  units: player.unitsCreatedOn && player.unitsKilledOn && player.unitsLostOn
    ? {
      created: countAllUnits(player.unitsCreated),
      killed: countAllUnits(player.unitsKilledPlain),
      lost: countAllUnits(player.unitsLostPlain)
    }
    : undefined
});

/** Sum of the stats of several players */
const sumStats = (stats: Stats[]): Stats => ({
  resources: [0, 1, 2].map(index => stats.reduce((sum, item) => sum + item.resources[index], 0)),
  units: stats.every(item => item.units)
    ? {
      created: stats.reduce((sum, item) => sum + item.units!.created, 0),
      killed: stats.reduce((sum, item) => sum + item.units!.killed, 0),
      lost: stats.reduce((sum, item) => sum + item.units!.lost, 0)
    }
    : undefined
});

/** Resources collected and units created, killed and lost by teams, squads or players */
export const StatsTable = ({ replayInfo }: { replayInfo: ReplayParseResult }) => {
  const { t } = useTranslation();
  const [groupId, setGroupId] = React.useState<GroupId>('teams');

  const rowsByGroup = React.useMemo(() => {
    const playerResources = getPlayerResources(replayInfo.timeLine);
    const teams: Team[] = replayInfo.teams.filter((team: Team) => team.isPlayerTeam);
    const playerStats = (playerId: number) => getPlayerStats(replayInfo.players[playerId], playerResources[playerId]);
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
  }, [replayInfo, t]);

  const groupOptions = GROUPS.filter(group => rowsByGroup[group.id].length > 0)
    .map(group => ({ id: group.id, name: t(group.name) }));
  const currentGroup = groupOptions.find(option => option.id === groupId) ?? groupOptions[0];
  const rows = rowsByGroup[currentGroup?.id] ?? [];

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
        <Table sx={{ tableLayout: 'fixed', width: '100%', minWidth: TABLE_MIN_WIDTH }}>
          <TableHead>
            <TableRow>
              <StatsTableHeaderCell sx={{ paddingLeft: EDGE_PADDING }}>{currentGroup && t(GROUPS.find(group => group.id === currentGroup.id)!.name)}</StatsTableHeaderCell>
              {COLUMNS.map((column, index) =>
                <StatsTableHeaderCell key={column.label} align='center'
                  sx={{ width: column.width, paddingRight: isLastColumn(index) ? EDGE_PADDING : undefined }}>
                  <HeaderLabel label={t(column.label)} tooltip={t(column.tooltip)} />
                </StatsTableHeaderCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) =>
              <ColoredTableRow key={index} teamColor={row.teamColor}>
                <StatsTableCell sx={{ paddingLeft: EDGE_PADDING, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.name}
                </StatsTableCell>
                {COLUMNS.map((column, index) =>
                  <StatsTableCell key={column.label} align='right' sx={{ paddingRight: isLastColumn(index) ? EDGE_PADDING : undefined }}>
                    <StatValue value={column.value(row.stats)} image={column.image} />
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

/** Number with an optional icon after it; "-" if there is no value (no units data in the replay) */
const StatValue = ({ value, image }: { value?: number; image?: string }) => {
  const { i18n } = useTranslation();
  return (
    <Stack direction='row' alignItems='center' justifyContent='flex-end' gap={0.5}>
      <Typography variant='body2'>{value != null ? Math.round(value).toLocaleString(i18n.language) : '-'}</Typography>
      {image && <Image path={image} width={20} height={20} />}
    </Stack>
  );
};
