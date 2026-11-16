import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSkull } from '@fortawesome/free-solid-svg-icons';
import {
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import { NoBottomBorderRow } from '@/components/common/misc';
import { ColorIndicator } from '@/components/common/misc';
import { TagChip } from '@/components/common/TagChip';
import { WinIcon } from '@/pages/ReplaysPage/ReplayInfo/svg';
import { useGameContext } from '@/store/gameDataStore';
import { Image } from '@/components/common/Image';
import type { Player } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import { RESOURCE_IMAGES } from '@/pages/ReplaysPage/StatsTable';

const GeneralTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.8),
  maxWidth: 200
}));

const CellText = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}));

const RatingTag = styled(TagChip)(() => ({
  '& span': {
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingRight: '8px',
    paddingLeft: '8px',
  }
}));

/**
 * @param resources food, wood and iron collected by the player, absent if the replay has no time line
 * @param sent food, wood and iron sent to other players, absent without the additional replay data
 * @param received food, wood and iron received from other players after the tax, absent without the additional
 * replay data
 * @param apm average actions per minute, absent without the additional replay data
 */
export const GeneralTable = ({ player, resources, sent, received, apm }: {
  player: Player;
  resources?: number[];
  sent?: number[];
  received?: number[];
  apm?: number;
}) => {
  const isWide = useMediaQuery('(min-width:800px)');
  const { t, i18n } = useTranslation();
  const gameContext = useGameContext();
  // shown as the age of players that did not research any age
  const stoneAgeUnit = gameContext.units.find(unit => unit.gameId === Constants.STONE_AGE_UNIT_ID)!;

  const nickname = (
    <Stack direction="row" gap={0.75} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      <ColorIndicator
        color={player.color}
        sx={{ flexShrink: 0, width: '18px', height: '18px' }} />
      <CellText variant='body2' sx={{ minWidth: 0 }}>{player.nickname}</CellText>
    </Stack>
  );

  const apmLabel = (
    <Tooltip arrow title={t('replayPlayerTableApmTooltip')}>
      <span style={{ cursor: 'help' }}>{t('playerInfoApmCell')}</span>
    </Tooltip>
  );

  const ratingTag = (
    <RatingTag label={player.rating} />
  );

  const playerMatchResultIcon = (
    <Stack direction="row" gap={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      {player.isDead &&
        <CellText variant='body2'>
          {t('playerInfoDead')}
        </CellText>}
      {player.isDead &&
        <FontAwesomeIcon icon={faSkull} size='lg' widthAuto style={{ color: '#dd1d1dd4' }} />}
      {player.isWinner &&
        <CellText variant='body2'>
          {t('playerInfoWinner')}
        </CellText>}
      {player.isWinner &&
        <WinIcon sx={{
          display: 'inline-block',
          verticalAlign: 'middle',
          width: '18px',
          height: '18px',
          color: '#f27800'
        }} />}
    </Stack>
  );
  const wonderIcon = (
    <Stack direction="row" gap={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      {player.isWonderWin
        ? <CellText variant='body2'>
          {t('playerInfoWonderWin')}
        </CellText>
        : <CellText variant='body2'>
          {t('playerInfoWonderBuilt')}
        </CellText>}
      {player.isWonderWin
        ? <Image path={"/static/wonder_active.png"}
          width={18}
          height={18}
          isStatic={true} />
        : <Image path={"/static/wonder_inactive.png"}
          width={18}
          height={18}
          isStatic={true} />}
    </Stack>
  );

  const lastAgeResearch = player.lastAgeResearch
    ? { name: gameContext.researches[player.lastAgeResearch].name, image: gameContext.researches[player.lastAgeResearch].image }
    : { name: stoneAgeUnit.nation.ir1, image: stoneAgeUnit.image };
  const latestAge = (
    <Tooltip title={t(lastAgeResearch.name)}
      arrow
      placement="bottom"
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
      <Stack direction="row" gap={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <CellText variant='body2'>
          {t(lastAgeResearch.name)}
        </CellText>
        <Image path={lastAgeResearch.image}
          width={18}
          height={18} />
      </Stack>
    </Tooltip>
  );

  // label and amounts of the present resource rows
  const resourceRows = ([
    ['playerInfoResourcesCollectedCell', resources],
    ['playerInfoResourcesSentCell', sent],
    ['playerInfoResourcesReceivedCell', received]
  ] as const).filter((row): row is readonly [typeof row[0], number[]] => row[1] != null);

  // both tables have the same number of rows, so they stay aligned side by side
  const rowsLeft = [
    [t('playerInfoNicknameCell'), nickname],
    [t('playerInfoRatingCell'), ratingTag],
    [apmLabel, apm != null ? Math.round(apm).toLocaleString(i18n.language) : '-'],
    [t('playerInfoTeamCell'), t('replayTeam', { value: player.team })],
    [t('playerInfoGroupCell'), player.group ? t('replaySquad', { value: player.group }) : '-'],
  ];

  const rowsRight = [
    [t('playerInfoNicknameAutoCell'), player.isNicknameAutogenerated ? t('conditionOn') : t('conditionOff')],
    [t('playerInfoMatchResultCell'), playerMatchResultIcon],
    [t('playerInfoSurvivalTimeCell'), player.survivalOn ? Utils.formatDuration(player.survivalTime) : '-'],
    [t('playerInfoWonderCell'), player.researchOn && player.isWonderBuilt ? wonderIcon : '-'],
    [t('playerInfoLatestAgeCell'), player.researchOn ? latestAge : '-'],
  ];

  return (
    <Stack gap={1} sx={{ py: 1 }}>
      <Stack direction={isWide ? 'row' : 'column'} gap={1}>
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
      {/* full width rows under the 2 tables */}
      {resourceRows.length > 0 &&
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {resourceRows.map(([label, amounts]) =>
                <NoBottomBorderRow key={label}>
                  <GeneralTableCell align="left">{t(label)}</GeneralTableCell>
                  <GeneralTableCell align="right" sx={{ maxWidth: 'none' }}>
                    <ResourceAmounts amounts={amounts} />
                  </GeneralTableCell>
                </NoBottomBorderRow>)}
            </TableBody>
          </Table>
        </TableContainer>}
    </Stack>
  );
};

/** Food, wood and iron amounts in a line, each with its icon; only the ones with an amount, "-" if none has */
const ResourceAmounts = ({ amounts }: { amounts: number[] }) => {
  const { i18n } = useTranslation();
  const resourceIds = amounts.map((_, resourceId) => resourceId).filter(resourceId => Math.round(amounts[resourceId]) !== 0);
  return resourceIds.length > 0
    ? <Stack direction="row" gap={2} sx={{ justifyContent: 'flex-end' }}>
      {resourceIds.map(resourceId =>
        <Stack key={resourceId} direction="row" gap={0.5} sx={{ alignItems: 'center' }}>
          <CellText variant='body2'>{Math.round(amounts[resourceId]).toLocaleString(i18n.language)}</CellText>
          <Image path={RESOURCE_IMAGES[resourceId]} width={18} height={18} />
        </Stack>)}
    </Stack>
    : '-';
};
