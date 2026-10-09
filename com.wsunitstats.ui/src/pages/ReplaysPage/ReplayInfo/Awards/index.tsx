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
import type { UnitOption } from '@/types/game';
import { SectionTitle } from '@/pages/ReplaysPage/SectionTitle';

/** Iron is worth more due to its lower mining speed, the same as in the unit cost value of the exporter */
const IRON_VALUE = 1.5;
const WONDER_RESEARCH_TYPE = 'researchTypeWonderTransition';
/** Tryhard: the first wonder of the match built in this time or faster */
const TRYHARD_MAX_WONDER_TIME = 30 * 60 * 1000;
/** Unit tags (game ids) */
const WORKER_TAG = 3;
const ARMY_TAG = 4;
const AVIATION_TAG = 14;
const FLEET_TAG = 16;
const HORSEMAN_TAG = 25;
const STONE_AGE_UNIT_PREFIX = 'WarSelection/1/';
const UNIVERSITY_UNITS = ['WarSelection/4/university'];
/** Airfields and aircraft carriers (the anchored carriers are not created, the mobile ones turn into them) */
const AIRFIELD_UNITS = [
  'WarSelection/4/aerodrome',
  'WarSelection/4/fr/aircraft_carrier/mobile',
  'WarSelection/5/fr/aircraft_carrier/mobile'
];
/** Turtle: walls, gates, hedgehogs and dragon's teeth are cheap, each counts as a part of a defensive building */
const WALL_WEIGHT = 1 / 5;
/** Icons of the awards */
const WORKER_IMAGE = 'unit/WarSelection/5/worker.png';
const LARGE_FAMILIES_IMAGE = 'upgrade/117.png';
const DEATH_SCYTHE_IMAGE = 'unit/WarSelection/5/plu/cannon/elevation.png';
const BOAR_IMAGE = 'unit/WarSelection/animals/boar/male.png';
const TERNI_ARMORED_CAR_IMAGE = 'unit/WarSelection/4/it/armored_car_terni.png';
const UNIVERSITY_IMAGE = 'unit/WarSelection/4/university.png';
const STONE_AGE_WARRIOR_IMAGE = 'unit/WarSelection/1/warrior.png';
const AIRFIELD_IMAGE = 'unit/WarSelection/4/aerodrome.png';
const CAVALRYMAN_IMAGE = 'unit/WarSelection/5/cavalryman.png';
const LIGHT_TANK_IMAGE = 'unit/WarSelection/5/tank_light.png';
const ANTI_AIRCRAFT_GUN_IMAGE = 'unit/WarSelection/4/aaw_heavy.png';
const BATTLESHIP_IMAGE = 'unit/WarSelection/5/judgedredd.png';
const FISH_IMAGE = 'env/WarSelection/nature/water/fish/big.png';
const MINE_IMAGE = 'unit/WarSelection/4/mine_iron.png';
const HEAVY_PILLBOX_IMAGE = 'unit/WarSelection/4/de/pillbox/heavy.png';
/** Static image of the site, not of the game files */
const WONDER_WIN_IMAGE = '/static/wonder_active.png';
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
  /** the icon is a static image of the site, not one of the game files */
  isStaticImage?: boolean;
  /** undefined if the player has no data for it */
  measure: (player: Player) => Measure | undefined;
  /** the lowest value wins (time categories) instead of the highest */
  isLowestBest?: boolean;
  /** the award is given only if there is a leader and the condition is true for them; any leader by default */
  condition?: (leader: Leader) => boolean;
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

/**
 * Players with the best performance in a match: the wonder win, the most resources, units and kills, and the conditional
 * awards for outstanding numbers of special units and buildings; absent if nobody is awarded
 */
export const Awards = ({ replayInfo }: { replayInfo: ReplayParseResult }) => {
  const { t, i18n } = useTranslation();
  const gameContext = useGameContext();
  const columns = useMediaQuery('(min-width:800px)') ? 4 : 2;

  const awards = React.useMemo(() => {
    const teams: Team[] = replayInfo.teams.filter((team: Team) => team.isPlayerTeam);
    const players: Player[] = teams.flatMap(team => team.players.map((playerId: number) => replayInfo.players[playerId]));
    const playerResources = getPlayerResources(replayInfo.timeLine);
    const unitsById = new Map(gameContext.units.map(unit => [unit.gameId as string, unit]));
    const formatNumber = (value: number) => Math.round(value).toLocaleString(i18n.language);
    const formatTime = (value: number) => Utils.formatDuration(value);
    const count = (value?: number) => value != null ? { value } : undefined;
    const atLeast = (min: number) => (leader: Leader) => leader.value >= min;
    const hasTag = (unit: UnitOption, tag: number) => unit.unitTags.includes(tag);
    const isWonderResearch = (researchId: number) => gameContext.researches[researchId]?.type === WONDER_RESEARCH_TYPE;

    /** Number of the units of a category map the predicate is true for */
    const sumUnits = (unitStatsMap: Player['unitsCreated'], isMatching: (unit: UnitOption) => boolean) => {
      let sum = 0;
      for (const units of (unitStatsMap as Map<string, { id: string; number: number }[]>).values()) {
        for (const unit of units) {
          const unitOption = unitsById.get(unit.id);
          if (unitOption && isMatching(unitOption)) {
            sum += unit.number;
          }
        }
      }
      return sum;
    };
    const created = (player: Player, isMatching: (unit: UnitOption) => boolean) =>
      count(player.unitsCreatedOn ? sumUnits(player.unitsCreated, isMatching) : undefined);
    const killed = (player: Player, isMatching: (unit: UnitOption) => boolean) =>
      count(player.unitsKilledOn ? sumUnits(player.unitsKilledPlain, isMatching) : undefined);

    // the wonder icon is the one of the wonder the player built
    const wonderMeasure = (player: Player) => {
      const research = firstResearch(player, isWonderResearch);
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

    // defensive buildings, walls count as a part of a building
    const defensiveBuildings = (player: Player) => {
      if (!player.unitsCreatedOn) {
        return undefined;
      }
      const buildings = sumUnits(player.unitsCreated, unit => unit.advancedCategory === 'build-def' && !hasTag(unit, ARMY_TAG));
      const walls = sumUnits(player.unitsCreated, unit => unit.advancedCategory === 'wall');
      return { value: buildings + walls * WALL_WEIGHT };
    };

    // unconditional awards first, then the conditional ones
    const categories: AwardCategory[] = [
      {
        title: 'replayAwardsLongRun',
        description: 'replayAwardsLongRunDescription',
        image: WONDER_WIN_IMAGE,
        isStaticImage: true,
        measure: player => player.isWonderWin ? { value: wonderMeasure(player)?.value ?? 0 } : undefined,
        isLowestBest: true,
        format: formatTime
      },
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
        title: 'replayAwardsHunter',
        description: 'replayAwardsHunterDescription',
        image: TERNI_ARMORED_CAR_IMAGE,
        // workers, fishing boats, tractors and engineers have the worker tag, the cargo elephant is a worker by category
        measure: player => killed(player, unit => hasTag(unit, WORKER_TAG) || unit.advancedCategory === 'worker'),
        condition: atLeast(80),
        format: formatNumber
      },
      {
        title: 'replayAwardsTraitor',
        description: 'replayAwardsTraitorDescription',
        image: BOAR_IMAGE,
        measure: player => count(alliesKilled(player)),
        condition: leader => leader.value > 25,
        format: formatNumber
      },
      {
        title: 'replayAwardsTryhard',
        description: 'replayAwardsTryhardDescription',
        image: gameContext.researches.find(research => research.type === WONDER_RESEARCH_TYPE)?.image,
        measure: wonderMeasure,
        isLowestBest: true,
        condition: leader => leader.value <= TRYHARD_MAX_WONDER_TIME,
        format: formatTime
      },
      {
        title: 'replayAwardsProfessor',
        description: 'replayAwardsProfessorDescription',
        image: UNIVERSITY_IMAGE,
        measure: player => created(player, unit => UNIVERSITY_UNITS.includes(unit.gameId)),
        condition: atLeast(5),
        format: formatNumber
      },
      {
        title: 'replayAwardsUgaBuga',
        description: 'replayAwardsUgaBugaDescription',
        image: STONE_AGE_WARRIOR_IMAGE,
        // army units only: no workers, builders and scouts
        measure: player => created(player, unit => unit.gameId.startsWith(STONE_AGE_UNIT_PREFIX) && hasTag(unit, ARMY_TAG)
          && !hasTag(unit, WORKER_TAG)),
        condition: atLeast(40),
        format: formatNumber
      },
      {
        title: 'replayAwardsDispatcher',
        description: 'replayAwardsDispatcherDescription',
        image: AIRFIELD_IMAGE,
        measure: player => created(player, unit => AIRFIELD_UNITS.includes(unit.gameId)),
        condition: atLeast(35),
        format: formatNumber
      },
      {
        title: 'replayAwardsRider',
        description: 'replayAwardsRiderDescription',
        image: CAVALRYMAN_IMAGE,
        measure: player => created(player, unit => hasTag(unit, HORSEMAN_TAG)),
        condition: atLeast(100),
        format: formatNumber
      },
      {
        title: 'replayAwardsBlitzkrieg',
        description: 'replayAwardsBlitzkriegDescription',
        image: LIGHT_TANK_IMAGE,
        measure: player => created(player, unit => !!unit.additionalClassifiers?.isGroundCombatVehicle),
        condition: atLeast(50),
        format: formatNumber
      },
      {
        title: 'replayAwardsClearSky',
        description: 'replayAwardsClearSkyDescription',
        image: ANTI_AIRCRAFT_GUN_IMAGE,
        measure: player => killed(player, unit => hasTag(unit, AVIATION_TAG)),
        condition: atLeast(50),
        format: formatNumber
      },
      {
        title: 'replayAwardsSeaDog',
        description: 'replayAwardsSeaDogDescription',
        image: BATTLESHIP_IMAGE,
        measure: player => killed(player, unit => hasTag(unit, FLEET_TAG)),
        condition: atLeast(40),
        format: formatNumber
      },
      {
        title: 'replayAwardsMerchantFleet',
        description: 'replayAwardsMerchantFleetDescription',
        image: FISH_IMAGE,
        // fishing boats are the workers of the fleet
        measure: player => created(player, unit => hasTag(unit, WORKER_TAG) && hasTag(unit, FLEET_TAG)),
        condition: atLeast(60),
        format: formatNumber
      },
      {
        title: 'replayAwardsFreeMoney',
        description: 'replayAwardsFreeMoneyDescription',
        image: MINE_IMAGE,
        // buildings with income: mines and sea gardens
        measure: player => created(player, unit => unit.advancedCategory === 'mine'),
        condition: atLeast(25),
        format: formatNumber
      },
      {
        title: 'replayAwardsTurtle',
        description: 'replayAwardsTurtleDescription',
        image: HEAVY_PILLBOX_IMAGE,
        measure: defensiveBuildings,
        condition: atLeast(90),
        format: formatNumber
      }
    ];
    return categories
      .map(category => ({ category, leader: findLeader(players, teams, category) }))
      .filter((award): award is { category: AwardCategory; leader: Leader } =>
        !!award.leader && (award.category.condition?.(award.leader) ?? true));
  }, [replayInfo, gameContext.units, gameContext.researches, i18n.language]);

  if (awards.length === 0) {
    return null;
  }
  // the tiles of an incomplete last row are centered: each tile spans 2 of the twice as many grid columns,
  // and the first tile of the last row is shifted by one grid column per missing tile
  const lastRowSize = awards.length % columns;
  const lastRowStart = awards.length - lastRowSize;
  return (
    <Box>
      <SectionTitle>{t('replayAwardsTitle')}</SectionTitle>
      {/* rows of the same height: all tiles are as tall as the tallest one */}
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns * 2}, minmax(0, 1fr))`, gridAutoRows: '1fr', gap: 1 }}>
        {awards.map(({ category, leader }, index) =>
          <AwardTile key={category.title}
            gridColumn={lastRowSize > 0 && index === lastRowStart ? `${columns - lastRowSize + 1} / span 2` : 'span 2'}
            title={t(category.title)}
            description={category.description && t(category.description)}
            icon={leader.image
              ? <MedalImage path={leader.image} />
              : <MedalImage path={category.image ?? ''} isStatic={category.isStaticImage} />}
            teamColor={leader.team?.color}
            nickname={leader.player.nickname}
            playerLink={Utils.getUrlWithPathParams([
              { param: Constants.REPLAY_PLAYER_INFO_PAGE_PATH, pos: 4 },
              { param: leader.player.id, pos: 5 }
            ])}
            value={category.format(leader.value)} />)}
      </Box>
    </Box>
  );
};

/**
 * Tile with the leader's nickname at the top, the medal, the category title and the description with the leader's value
 * in parentheses under it. The tile opens the leader's player page
 */
const AwardTile = ({ gridColumn, title, description, icon, teamColor, nickname, value, playerLink }: {
  gridColumn: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  teamColor?: Team['color'];
  nickname: string;
  value: string;
  playerLink: string;
}) => {
  const theme = useTheme();
  const content = (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', height: '100%', p: 1 }}>
      <Typography variant='body1' sx={{
        mb: 0.5,
        fontWeight: 500,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {nickname}
      </Typography>
      <Medal>{icon}</Medal>
      <Stack sx={{ flexGrow: 1, mt: 0.5 }}>
        <GoldTitle>{title}</GoldTitle>
        {/* 2 lines are reserved, so a description that wraps does not move the title of its tile */}
        <Typography color='text.secondary' sx={{ fontSize: '0.7rem', lineHeight: 1.3, minHeight: '2.6em' }}>
          {description ? `${description} (${value})` : value}
        </Typography>
      </Stack>
    </Stack>
  );
  return (
    <Paper sx={{
      gridColumn,
      backgroundColor: teamColor && (theme.palette.mode === 'dark' ? teamColor.dark : teamColor.light),
      // no paper overlay over the team color in the dark mode
      backgroundImage: teamColor && 'none',
      overflow: 'hidden'
    }}>
      <CardActionArea component={Link} to={playerLink} sx={{ height: '100%' }}>{content}</CardActionArea>
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
    // Times is a narrower serif than Georgia; the condensed face is used where the font has one
    fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
    fontStretch: 'condensed',
    fontSize: '1.15rem',
    fontWeight: 'bold',
    lineHeight: 1.3,
    filter: theme => theme.palette.mode === 'dark'
      ? 'drop-shadow(0 1px 0.5px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 2px rgba(0, 0, 0, 0.35))'
      // a tight black outline and a stronger shadow separate the gold from the light backgrounds
      : 'drop-shadow(0 0 0.7px rgba(0, 0, 0, 0.8)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 3px rgba(0, 0, 0, 0.35))'
  }}>
    <Box component='span' sx={{
      background: 'linear-gradient(180deg, #e2c26a 0%, #e0b955 25%, #d6a83e 47%, #bf9032 53%, #d4a842 75%, #dbb75e 100%)',
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

const MedalImage = ({ path, isStatic }: { path: string; isStatic?: boolean }) => (
  <Image path={path} isStatic={isStatic} width={MEDAL_SHOWN_ICON_SIZE} height={MEDAL_SHOWN_ICON_SIZE}
    sx={{ display: 'block', objectFit: 'cover' }} />
);
