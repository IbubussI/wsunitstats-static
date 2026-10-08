import * as React from 'react';
import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import { Box, CardActionArea, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '@/store/gameDataStore';
import { Image } from '@/components/common/Image';
import { getPlayerResources } from '@/pages/ReplaysPage/StatsTable';
import { countAllUnits } from '@/pages/ReplaysPage/PlayerInfo/UnitsInfo/unitsInfo';
import type { Player, ReplayParseResult, Team } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

/** Iron is worth more due to its lower mining speed, the same as in the unit cost value of the exporter */
const IRON_VALUE = 1.5;
/** Age transition researches by age (ids of the replay research timeline) */
const BRONZE_AGE_RESEARCHES = [3, 4, 90, 91];
const MEDIEVAL_AGE_RESEARCHES = [5, 6, 7, 8];
/** First industrial revolution of each country (the same ids as in ageNationFinder) */
const IR_RESEARCHES = [59, 61, 62, 63, 64, 65, 67, 68, 69, 70, 71, 72, 73];
const WONDER_RESEARCH_TYPE = 'researchTypeWonderTransition';
/** Icons of the categories: abstract country IR worker, tradition of large families research, Death's Scythe cannon, boar */
const WORKER_IMAGE = 'unit/WarSelection/5/worker.png';
const LARGE_FAMILIES_IMAGE = 'upgrade/117.png';
const DEATH_SCYTHE_IMAGE = 'unit/WarSelection/5/plu/cannon/elevation.png';
const BOAR_IMAGE = 'unit/WarSelection/animals/boar/male.png';
/** Medal drawing size: the icon is in the middle of its disc, the ribbons go below */
const MEDAL_WIDTH = 56;
const MEDAL_HEIGHT = 64;
const MEDAL_DISC_RADIUS = 26;
const MEDAL_ICON_SIZE = 34;
/** The medal is shown smaller than drawn */
const MEDAL_SCALE = 1 / 1.3;
const MEDAL_SHOWN_ICON_SIZE = Math.round(MEDAL_ICON_SIZE * MEDAL_SCALE);

/** Value of a player in a category; image is the icon of the tile if it depends on the player */
interface Measure {
  value: number;
  image?: string;
}

/** Player that did best in a category, absent if nobody did anything in it */
interface Leader extends Measure {
  player: Player;
  team?: Team;
}

interface AwardCategory {
  title: string;
  description?: string;
  /** icon of the tile, unless the leader's measure has its own */
  image?: string;
  /** undefined if the player has no data for it */
  measure: (player: Player) => Measure | undefined;
  /** the lowest value wins (time categories) instead of the highest */
  isLowestBest?: boolean;
  format: (value: number) => string;
}

/** The first research from the list the player took, undefined if the player did not take any of them */
const firstResearch = (player: Player, isMatching: (researchId: number) => boolean) => {
  if (!player.researchOn) {
    return undefined;
  }
  return (player.researches as { id: number; takenTime: number }[])
    .filter(research => isMatching(research.id))
    .reduce<{ id: number; takenTime: number } | undefined>((first, research) =>
      !first || research.takenTime < first.takenTime ? research : first, undefined);
};

/** The player with the best value of the category; zero values do not count */
const findLeader = (players: Player[], teams: Team[], category: AwardCategory): Leader | undefined => {
  let leader: Leader | undefined;
  for (const player of players) {
    const measure = category.measure(player);
    if (!measure || measure.value <= 0) {
      continue;
    }
    const isBetter = !leader
      || (category.isLowestBest ? measure.value < leader.value : measure.value > leader.value);
    if (isBetter) {
      leader = { ...measure, player, team: teams.find(team => team.players.includes(player.id)) };
    }
  }
  return leader;
};

/** Players with the best performance in a match: the most resources, units, kills and the fastest ages */
export const Awards = ({ replayInfo }: { replayInfo: ReplayParseResult }) => {
  const { t, i18n } = useTranslation();
  const gameContext = useGameContext();
  const isWide = useMediaQuery('(min-width:800px)');

  const leaders = React.useMemo(() => {
    const teams: Team[] = replayInfo.teams.filter((team: Team) => team.isPlayerTeam);
    const players: Player[] = teams.flatMap(team => team.players.map((playerId: number) => replayInfo.players[playerId]));
    const playerResources = getPlayerResources(replayInfo.timeLine);
    const formatNumber = (value: number) => Math.round(value).toLocaleString(i18n.language);
    const formatTime = (value: number) => Utils.formatDuration(value);
    const count = (value?: number) => value != null ? { value } : undefined;
    // the age icon is the one of the research the player took
    const researchMeasure = (player: Player, isMatching: (researchId: number) => boolean) => {
      const research = firstResearch(player, isMatching);
      return research && { value: research.takenTime, image: gameContext.researches[research.id]?.image };
    };

    // units killed of the other factions of the player's team
    const alliesKilled = (player: Player) => {
      if (!player.unitsKilledOn) {
        return undefined;
      }
      const team = teams.find(team => team.players.includes(player.id));
      return (player.unitsKilledByFaction as { factionId: number; units: Player['unitsCreated'] }[])
        .filter(group => group.factionId !== player.factionId && team?.factions.includes(group.factionId))
        .reduce((sum, group) => sum + countAllUnits(group.units), 0);
    };

    const categories: AwardCategory[] = [
      {
        title: 'replayAwardsResourceManager',
        description: 'replayAwardsResourceManagerDescription',
        image: WORKER_IMAGE,
        measure: player => {
          const resources = playerResources[player.id];
          return resources && { value: resources[0] + resources[1] + resources[2] * IRON_VALUE };
        },
        format: formatNumber
      },
      {
        title: 'replayAwardsFatBoy',
        description: 'replayAwardsFatBoyDescription',
        image: LARGE_FAMILIES_IMAGE,
        measure: player => count(player.unitsCreatedOn ? countAllUnits(player.unitsCreated) : undefined),
        format: formatNumber
      },
      {
        title: 'replayAwardsWarMachine',
        description: 'replayAwardsWarMachineDescription',
        image: DEATH_SCYTHE_IMAGE,
        measure: player => count(player.unitsKilledOn ? countAllUnits(player.unitsKilledPlain) : undefined),
        format: formatNumber
      },
      {
        title: 'replayAwardsTraitor',
        description: 'replayAwardsTraitorDescription',
        image: BOAR_IMAGE,
        measure: player => count(alliesKilled(player)),
        format: formatNumber
      },
      {
        title: 'replayAwardsFastestBronze',
        image: gameContext.researches[BRONZE_AGE_RESEARCHES[0]]?.image,
        measure: player => researchMeasure(player, id => BRONZE_AGE_RESEARCHES.includes(id)),
        isLowestBest: true,
        format: formatTime
      },
      {
        title: 'replayAwardsFastestMedieval',
        image: gameContext.researches[MEDIEVAL_AGE_RESEARCHES[0]]?.image,
        measure: player => researchMeasure(player, id => MEDIEVAL_AGE_RESEARCHES.includes(id)),
        isLowestBest: true,
        format: formatTime
      },
      {
        title: 'replayAwardsFastestIR',
        image: gameContext.researches[IR_RESEARCHES[0]]?.image,
        measure: player => researchMeasure(player, id => IR_RESEARCHES.includes(id)),
        isLowestBest: true,
        format: formatTime
      },
      {
        title: 'replayAwardsFastestWonder',
        image: gameContext.researches.find(research => research.type === WONDER_RESEARCH_TYPE)?.image,
        measure: player => researchMeasure(player,
          id => gameContext.researches[id]?.type === WONDER_RESEARCH_TYPE),
        isLowestBest: true,
        format: formatTime
      }
    ];
    return categories.map(category => ({ category, leader: findLeader(players, teams, category) }));
  }, [replayInfo, gameContext.researches, i18n.language]);

  return (
    // rows of the same height: all tiles are as tall as the tallest one
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${isWide ? 4 : 2}, minmax(0, 1fr))`, gridAutoRows: '1fr', gap: 1 }}>
      {leaders.map(({ category, leader }) =>
        <AwardTile key={category.title}
          title={t(category.title)}
          description={category.description && t(category.description)}
          icon={<MedalImage path={leader?.image ?? category.image ?? ''} />}
          teamColor={leader?.team?.color}
          nickname={leader?.player.nickname}
          playerLink={leader && Utils.getUrlWithPathParams([
            { param: Constants.REPLAY_PLAYER_INFO_PAGE_PATH, pos: 4 },
            { param: leader.player.id, pos: 5 }
          ])}
          value={leader && category.format(leader.value)} />)}
    </Box>
  );
};

/**
 * Tile with the medal at the top, the category title and the leader's nickname and value at the bottom,
 * so they are aligned in a row of tiles; "-" if there is no leader. A tile with a leader opens the leader's player page
 */
const AwardTile = ({ title, description, icon, teamColor, nickname, value, playerLink }: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  teamColor?: Team['color'];
  nickname?: string;
  value?: string;
  playerLink?: string;
}) => {
  const theme = useTheme();
  const content = (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', height: '100%', p: 1 }}>
      <Medal>{icon}</Medal>
      <Stack sx={{ flexGrow: 1, mt: 0.5 }}>
        <GoldTitle>{title}</GoldTitle>
        {description &&
          <Typography color='text.secondary' sx={{ fontSize: '0.7rem' }}>({description})</Typography>}
      </Stack>
      <Typography variant='body1' sx={{
        mt: 1,
        fontWeight: 'bold',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {nickname ?? '-'}
      </Typography>
      {/* empty line keeps the nicknames aligned when there is no leader */}
      <Typography variant='body2'>{value ?? ' '}</Typography>
    </Stack>
  );
  return (
    <Paper sx={{
      backgroundColor: teamColor && (theme.palette.mode === 'dark' ? teamColor.dark : teamColor.light),
      // no paper overlay over the team color in the dark mode
      backgroundImage: teamColor && 'none',
      overflow: 'hidden'
    }}>
      {playerLink
        ? <CardActionArea component={Link} to={playerLink} sx={{ height: '100%' }}>{content}</CardActionArea>
        : content}
    </Paper>
  );
};

/**
 * Title in polished gold letters: a metallic gradient clipped to the serif text with a dark shadow
 * to stand out on light backgrounds. The gradient is inside an inline span, cloned per line, so every
 * wrapped line gets the full gradient
 */
const GoldTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography component='div' sx={{
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '1.15rem',
    fontWeight: 'bold',
    lineHeight: 1.3,
    letterSpacing: '0.02em',
    filter: theme => theme.palette.mode === 'dark'
      ? 'drop-shadow(0 1px 0.5px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 2px rgba(0, 0, 0, 0.35))'
      // a thin dark brown outline separates the gold from the light backgrounds
      : 'drop-shadow(0 0 0.6px rgba(60, 38, 0, 0.9)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))'
  }}>
    <Box component='span' sx={{
      // darker antique gold on the light theme
      background: theme => theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, #e2c26a 0%, #e0b955 25%, #cc9d32 47%, #ad7f24 53%, #d4a842 75%, #dbb75e 100%)'
        : 'linear-gradient(180deg, #a98226 0%, #9a7218 25%, #805a0e 47%, #654606 53%, #8c6513 75%, #9e7922 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      WebkitBoxDecorationBreak: 'clone',
      boxDecorationBreak: 'clone'
    }}>
      {children}
    </Box>
  </Typography>
);

/** Golden medal on two ribbons with the icon in the middle of its disc */
const Medal = ({ children }: { children: React.ReactNode }) => {
  const center = MEDAL_WIDTH / 2;
  const iconOffset = center * MEDAL_SCALE - MEDAL_SHOWN_ICON_SIZE / 2;
  return (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      <svg width={MEDAL_WIDTH * MEDAL_SCALE} height={MEDAL_HEIGHT * MEDAL_SCALE} viewBox={`0 0 ${MEDAL_WIDTH} ${MEDAL_HEIGHT}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id='awardMedalGold' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stopColor='#ffe082' />
            <stop offset='0.5' stopColor='#ffb300' />
            <stop offset='1' stopColor='#c17900' />
          </linearGradient>
        </defs>
        <polygon points={`${center - 16},${center + 10} ${center - 4},${center + 14} ${center - 10},${MEDAL_HEIGHT} ${center - 16},${MEDAL_HEIGHT - 6} ${center - 22},${MEDAL_HEIGHT}`} fill='#c62828' />
        <polygon points={`${center + 16},${center + 10} ${center + 4},${center + 14} ${center + 10},${MEDAL_HEIGHT} ${center + 16},${MEDAL_HEIGHT - 6} ${center + 22},${MEDAL_HEIGHT}`} fill='#1565c0' />
        <circle cx={center} cy={center} r={MEDAL_DISC_RADIUS} fill='url(#awardMedalGold)' stroke='#8d5a00' strokeWidth={1.5} />
        <circle cx={center} cy={center} r={MEDAL_ICON_SIZE / 2 + 1.5} fill='#5d3a00' />
      </svg>
      <Box sx={{
        position: 'absolute',
        top: iconOffset,
        left: iconOffset,
        width: MEDAL_SHOWN_ICON_SIZE,
        height: MEDAL_SHOWN_ICON_SIZE,
        borderRadius: '50%',
        overflow: 'hidden'
      }}>
        {children}
      </Box>
    </Box>
  );
};

const MedalImage = ({ path }: { path: string }) => (
  <Image path={path} width={MEDAL_SHOWN_ICON_SIZE} height={MEDAL_SHOWN_ICON_SIZE} sx={{ display: 'block', objectFit: 'cover' }} />
);
