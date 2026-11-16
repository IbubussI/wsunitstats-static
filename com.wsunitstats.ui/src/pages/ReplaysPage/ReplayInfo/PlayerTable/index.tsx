import * as React from 'react';
import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import {
  alpha,
  Box,
  Button,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Tooltip,
} from '@mui/material';
import { DeadIcon, MVPIcon, WinIcon } from '@/pages/ReplaysPage/ReplayInfo/svg';
import { IconTagChip, TagChip } from '@/components/common/TagChip';
import { Image } from '@/components/common/Image';
import { useTranslation } from 'react-i18next';
import { NoBottomBorderRow } from '@/components/common/misc';
import { Link, useSearchParams } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useGameContext } from '@/store/gameDataStore';
import type { Player, ReplayParseResult, Team } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import { ColorIndicator } from '@/components/common/misc';
import { calcKillDeath } from '@/pages/ReplaysPage/ReplayInfo/killDeath';
import { calcApm, findPlayerActivity } from '@/pages/ReplaysPage/ReplayInfo/playerActivity';
import type { ReplayExtraData } from '@/pages/ReplaysPage/ReplayInfo/replayAnalyzer';

const PlayerTableCell = styled(TableCell)(({ theme }) => ({
  borderColor: alpha(theme.palette.grey[700], 0.6),
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.8)
}));

const PlayerTableHeaderCell = styled(TableCell)(({ theme }) => ({
  borderColor: alpha(theme.palette.grey[700], 0.6),
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.6),
  lineHeight: '1rem',
  color: theme.palette.grey[700]
}));

/** Width of the rating column: fits a chip of a 4-digit rating with the cell padding, the same for any ratings */
const RATING_WIDTH = '60px';

const RatingTag = styled(TagChip)(() => ({
  '& span': {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingRight: '8px',
    paddingLeft: '8px',
  }
}));

/** K/D chip colors from the highest K/D: the color of the first range the K/D is not less than */
const KD_COLORS = [
  { min: 5, color: '#8e24aa' }, // purple
  { min: 1, color: '#43a047' }, // green: kills are not less than losses
  { min: -Infinity, color: '#e53935' } // red
];

/** K/D value in a chip, colored by its range */
const KdTag = ({ value }: { value: number }) => (
  <RatingTag label={value.toFixed(2)} bgColor={KD_COLORS.find(range => value >= range.min)!.color} />
);

const MVPTag = styled(IconTagChip)(() => ({
  '& span': {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingRight: '8px',
    paddingLeft: '8px',
  }
}))

/** Row in the color of the team (light or dark by the theme) */
export const ColoredTableRow = styled(NoBottomBorderRow, {
  shouldForwardProp: (prop) => prop !== "teamColor"
})<{ teamColor: { dark: string; light: string } }>(({ theme, teamColor }) => {
  const color = theme.palette.mode === 'dark'
    ? teamColor.dark
    : teamColor.light;
  return {
    backgroundColor: color,
    '&:hover': {
      backgroundColor: alpha(color, 0.8)
    }
  };
});

/** APM chip colors from the highest APM: the color of the first range the APM is not less than */
const APM_COLORS = [
  { min: 120, color: '#8e24aa' }, // purple
  { min: 50, color: '#43a047' }, // green
  { min: -Infinity, color: '#e53935' } // red
];

/** APM value in a chip, colored by its range; none for 0 APM */
const ApmTag = ({ value }: { value: number }) => {
  const rounded = Math.round(value);
  if (rounded === 0) {
    return null;
  }
  return <RatingTag label={rounded} bgColor={APM_COLORS.find(range => rounded >= range.min)!.color} />;
};

interface MvpShare {
  percent: number;
  /** the highest or the lowest score of the team; absent if all the scores of the team are equal */
  rank?: 'best' | 'least';
}

/** Colors of the best and the least share of a team: light and dark theme */
const MVP_SHARE_COLORS = {
  best: { light: '#8e24aa', dark: '#ce93d8' },
  least: { light: '#d32f2f', dark: '#ef5350' }
};

/**
 * Player id → whole percent of the score of the player's team. Rounded by the largest remainder, so the shares of a team
 * sum up to exactly 100%; absent for players without a score and in teams of one scored player
 */
const calcMvpShares = (teams: Team[], players: Player[]) => {
  const shares = new Map<number, MvpShare>();
  for (const team of teams) {
    const scored = (team.players as number[])
      .map(playerId => players[playerId])
      .filter(player => player.mvpScore != null && player.mvpScore >= 0);
    const total = scored.reduce((sum, player) => sum + Number(player.mvpScore), 0);
    if (scored.length < 2 || total <= 0) {
      continue;
    }
    const exact = scored.map(player => ({ id: player.id as number, value: Number(player.mvpScore) * 100 / total }));
    // ranks by the exact values, the rounded ones can tie
    const best = Math.max(...exact.map(entry => entry.value));
    const least = Math.min(...exact.map(entry => entry.value));
    const getRank = (value: number) => best === least ? undefined : value === best ? 'best' : value === least ? 'least' : undefined;
    exact.forEach(entry => shares.set(entry.id, { percent: Math.floor(entry.value), rank: getRank(entry.value) }));
    const missing = 100 - exact.reduce((sum, entry) => sum + Math.floor(entry.value), 0);
    [...exact]
      .sort((a, b) => (b.value - Math.floor(b.value)) - (a.value - Math.floor(a.value)))
      .slice(0, missing)
      .forEach(entry => shares.get(entry.id)!.percent++);
  }
  return shares;
};

/** Column header text with a tooltip explaining the column */
const HeaderLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Tooltip arrow title={tooltip}>
    <span style={{ cursor: 'help' }}>{label}</span>
  </Tooltip>
);

/** @param extraData additional replay data: the APM column is shown only with it */
export const PlayerTable = ({ replayInfo, extraData }: { replayInfo: ReplayParseResult; extraData: ReplayExtraData | null }) => {
  const { t } = useTranslation();
  const gameContext = useGameContext();
  const [searchParams] = useSearchParams();
  // the plain K/D (not by unit value) is shown in the debug mode only
  const isDebug = !!searchParams.get('debug');
  // shown as the age of players that did not research any age
  const stoneAgeUnit = gameContext.units.find(unit => unit.gameId === Constants.STONE_AGE_UNIT_ID)!;
  const costValues = React.useMemo(
    () => new Map(gameContext.units.map(unit => [unit.gameId as string, unit.costValue])),
    [gameContext.units]);
  const mvpShares = React.useMemo(
    () => calcMvpShares(replayInfo.teams.filter((team: Team) => team.isPlayerTeam), replayInfo.players),
    [replayInfo]);
  // player id → average actions per minute
  const apms = React.useMemo(() => extraData && new Map<number, number | undefined>(replayInfo.players.map((player: Player) => {
    const activity = findPlayerActivity(extraData, player.id, replayInfo.match.duration);
    return [player.id, activity && calcApm(activity)];
  })), [replayInfo, extraData]);

  return (
    <TableContainer component={Paper} >
      <Table>
        <TableHead>
          <NoBottomBorderRow>
            {/* Link, Color (empty on fixed maps, the cell is always there), Nickname */}
            <PlayerTableHeaderCell colSpan={3}>
              <HeaderLabel label={t('replayPlayerTablePlayerHeader')} tooltip={t('replayPlayerTablePlayerTooltip')} />
            </PlayerTableHeaderCell>
            {apms && <PlayerTableHeaderCell align='center'>
              <HeaderLabel label={t('replayPlayerTableApmHeader')} tooltip={t('replayPlayerTableApmTooltip')} />
            </PlayerTableHeaderCell>}
            {/* K/D: raw (debug), by unit value */}
            {isDebug && <PlayerTableHeaderCell align='center'>
              <HeaderLabel label={t('replayPlayerTableKdHeader')} tooltip={t('replayPlayerTableKdTooltip')} />
            </PlayerTableHeaderCell>}
            <PlayerTableHeaderCell align='center'>
              <HeaderLabel label={t('replayPlayerTableKdvHeader')} tooltip={t('replayPlayerTableKdvTooltip')} />
            </PlayerTableHeaderCell>
            {/* MVP Rating, share of the team score, MVP Icon */}
            <PlayerTableHeaderCell colSpan={3} align='center'>
              <HeaderLabel label={t('replayPlayerTableMVPHeader')} tooltip={t('replayPlayerTableMVPTooltip')} />
            </PlayerTableHeaderCell>
            {/* Squad */}
            <PlayerTableHeaderCell align='center'>
              <HeaderLabel label={t('replayPlayerTableSquadHeader')} tooltip={t('replayPlayerTableSquadTooltip')} />
            </PlayerTableHeaderCell>
            {/* Lastest Age Reached, Survival Time, Win/loose, Death, Wonder */}
            <PlayerTableHeaderCell colSpan={4} align='center'>
              <HeaderLabel label={t('replayPlayerTableSurvivalHeader')} tooltip={t('replayPlayerTableSurvivalTooltip')} />
            </PlayerTableHeaderCell>
            {/* Rating */}
            <PlayerTableHeaderCell align='right' sx={{ width: RATING_WIDTH, minWidth: RATING_WIDTH, whiteSpace: 'nowrap' }}>
              <HeaderLabel label={t('replayPlayerTableRatingHeader')} tooltip={t('replayPlayerTableRatingTooltip')} />
            </PlayerTableHeaderCell>
          </NoBottomBorderRow>
        </TableHead>
        <TableBody>
          {replayInfo.teams.filter((team: Team) => team.isPlayerTeam).map((team: Team) => {
            return team.players.map((playerId: number) => {
              const player = replayInfo.players[playerId];
              const killDeath = calcKillDeath(player, costValues);
              const mvpShare = mvpShares.get(player.id);
              const lastAgeResearch = player.lastAgeResearch
                ? { name: gameContext.researches[player.lastAgeResearch].name, image: gameContext.researches[player.lastAgeResearch].image }
                : { name: stoneAgeUnit.nation.ir1, image: stoneAgeUnit.image };
              return (
                <ColoredTableRow key={player.id} teamColor={team.color}>
                  {/* Link */}
                  {<PlayerTableCell align="left" sx={{ width: '36px', height: '36px', py: 0.3, px: 0.4 }}>
                    <Button component={Link} to={Utils.getUrlWithPathParams([
                      { param: Constants.REPLAY_PLAYER_INFO_PAGE_PATH, pos: 4 },
                      { param: player.id, pos: 5 }
                    ])} sx={{ p: 0.3, minWidth: '0px' }}>
                      <OpenInNewIcon />
                    </Button>
                  </PlayerTableCell>}

                  {/* Color */}
                  <PlayerTableCell align="center" sx={{ width: '31px' }}>
                    {replayInfo.match.isMapGen && <ColorIndicator color={player.color} sx={{
                      height: '18px',
                      width: '18px'
                    }} />}
                  </PlayerTableCell>

                  {/* Nickname */}
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

                  {/* APM */}
                  {apms && <PlayerTableCell align="center" sx={{ width: '50px' }}>
                    {apms.get(player.id) != null && <ApmTag value={apms.get(player.id)!} />}
                  </PlayerTableCell>}

                  {/* K/D: raw (debug), by unit value */}
                  {isDebug && <PlayerTableCell align="center" sx={{ width: '50px' }}>
                    {killDeath && <KdTag value={killDeath.raw} />}
                  </PlayerTableCell>}
                  <PlayerTableCell align="center" sx={{ width: '50px' }}>
                    {killDeath && <KdTag value={killDeath.value} />}
                  </PlayerTableCell>

                  {/* MVP Rating */}
                  <PlayerTableCell align="right" sx={{ width: '30px', pr: 0 }}>
                    {player.mvpScore != null &&
                      <MVPTag bgColor="#bb6911" label={Number(player.mvpScore).toFixed(0)} />}
                  </PlayerTableCell>

                  {/* Share of the team score: its own column is as wide as the widest share, next to the chips */}
                  <PlayerTableCell align="left" sx={{ width: '1px', pl: 0.5, pr: 0.5, whiteSpace: 'nowrap' }}>
                    {mvpShare &&
                      <Tooltip arrow title={t('replayPlayerTableMVPShareTooltip')}>
                        <Box component='span' sx={(theme) => ({
                          fontSize: '0.85em',
                          fontWeight: mvpShare.rank === 'best' ? 700 : undefined,
                          color: mvpShare.rank ? MVP_SHARE_COLORS[mvpShare.rank][theme.palette.mode] : 'text.secondary',
                          fontVariantNumeric: 'tabular-nums',
                          cursor: 'help'
                        })}>
                          {mvpShare.percent}%
                        </Box>
                      </Tooltip>}
                  </PlayerTableCell>

                  {/* MVP Icon */}
                  <PlayerTableCell align="right" sx={{ px: 0, width: '18px' }}>
                    {player.isMvp &&
                      <MVPIcon
                        sx={{
                          display: 'block',
                          mt: '2px',
                          width: 18,
                          height: 18,
                          color: '#ef630f'
                        }} />}
                  </PlayerTableCell>

                  {/* Squad */}
                  <PlayerTableCell align="right" sx={{ width: '80px' }}>
                    {player.group != null && t('replaySquad', { value: player.group + 1 })}
                  </PlayerTableCell>

                  {/* Lastest Age Reached */}
                  <PlayerTableCell align="right" sx={{
                    width: '40px',
                    lineHeight: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                  }}>
                    {player.researchOn &&
                      <Tooltip title={t(lastAgeResearch.name)}
                        arrow
                        placement="right"
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, -8],
                                },
                              },
                            ],
                          },
                        }}>
                        <Image path={lastAgeResearch.image}
                          width={25}
                          height={25} />
                      </Tooltip>}
                  </PlayerTableCell>

                  {/* Survival Time */}
                  <PlayerTableCell align="right" sx={{ width: '100px', whiteSpace: 'nowrap' }}>
                    {player.isDead && <>
                      <span style={{ marginRight: '5px' }}>{Utils.formatDuration(player.survivalTime)}</span>
                      <DeadIcon style={{
                        color: '#dd1d1dd4'
                      }} />
                    </>}
                  </PlayerTableCell>

                  {/* Win */}
                  <PlayerTableCell align="center" sx={{
                    width: '18px',
                    paddingRight: 0,
                    paddingLeft: 0
                  }}>
                    {player.isWinner &&
                      <WinIcon sx={{
                        width: '20px',
                        height: '20px',
                        display: 'block',
                        color: '#f27800'
                      }} />}
                  </PlayerTableCell>

                  {/* Wonder */}
                  <PlayerTableCell align="right" sx={{ width: '30px', lineHeight: 0 }}>
                    {player.isWonderBuilt && player.isWonderWin &&
                      <Image path={"/static/wonder_active.png"}
                        width={18}
                        height={18}
                        isStatic={true} />}
                    {player.isWonderBuilt && !player.isWonderWin &&
                      <Image path={"/static/wonder_inactive.png"}
                        width={18}
                        height={18}
                        isStatic={true} />}
                  </PlayerTableCell>

                  {/* Rating */}
                  <PlayerTableCell align="right" sx={{ width: RATING_WIDTH, minWidth: RATING_WIDTH, whiteSpace: 'nowrap' }}>
                    {player.rating != null &&
                      <RatingTag label={player.rating} />}
                  </PlayerTableCell>
                </ColoredTableRow>
              );
            });
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
