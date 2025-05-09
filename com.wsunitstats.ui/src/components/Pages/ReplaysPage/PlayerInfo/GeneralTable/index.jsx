import * as Utils from 'utils/utils';
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
import { NoBottomBorderRow } from 'components/Atoms/Table';
import { ColorIndicator } from 'components/Atoms/ColorIndicator';
import { TagChip } from "components/Atoms/TagChip";
import { WinIcon } from 'components/Pages/ReplaysPage/ReplayInfo/svg';
import { GameDataContext } from 'gameDataContext';
import { useContext } from 'react';
import { Image } from 'components/Atoms/Renderer';

const GeneralTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.8),
  maxWidth: 200
}));

const CellText = styled(Typography)(({ theme }) => ({
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

export const GeneralTable = ({ player }) => {
  const isWide = useMediaQuery('(min-width:800px)');
  const { t } = useTranslation();
  const gameContext = useContext(GameDataContext);

  const playerColor = (
    <ColorIndicator
      color={player.color}
      sx={{
        display: 'inline-block',
        verticalAlign: 'middle',
        width: '18px',
        height: '18px'
      }} />
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
        <i className="fa-solid fa-skull fa-lg" style={{ color: '#dd1d1dd4' }}></i>}
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
    : { name: gameContext.units[0].nation.ir1, image: gameContext.units[0].image };
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

  const rowsLeft = [
    [t('playerInfoNicknameCell'), player.nickname],
    [t('playerInfoNicknameAutoCell'), player.isNicknameAutogenerated ? t('conditionOn') : t('conditionOff')],
    [t('playerInfoRatingCell'), ratingTag],
    [t('playerInfoTeamCell'), t('replayTeam', { value: player.team })],
    [t('playerInfoGroupCell'), player.group ? t('replaySquad', { value: player.group }) : '-'],
  ];

  const rowsRight = [
    [t('playerInfoColorCell'), playerColor],
    [t('playerInfoMatchResultCell'), playerMatchResultIcon],
    [t('playerInfoSurvivalTimeCell'), player.survivalOn ? Utils.formatDuration(player.survivalTime) : '-'],
    [t('playerInfoWonderCell'), player.researchOn && player.isWonderBuilt ? wonderIcon : '-'],
    [t('playerInfoLatestAgeCell'), player.researchOn ? latestAge : '-'],
  ];

  return (
    <Stack direction={isWide ? 'row' : 'column'} gap={1} sx={{ py: 1 }}>
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
