import * as Utils from 'utils/utils';
import * as Constants from 'utils/constants';
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
import { DeadIcon, MVPIcon, WinIcon } from 'components/Pages/ReplaysPage/ReplayInfo/svg';
import { IconTagChip, TagChip } from 'components/Atoms/TagChip';
import { Image } from 'components/Atoms/Renderer';
import { useTranslation } from 'react-i18next';
import { NoBottomBorderRow } from 'components/Atoms/Table';
import { Link } from 'react-router-dom';
import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useContext } from 'react';
import { GameDataContext } from 'gameDataContext';
import { ColorIndicator } from 'components/Atoms/ColorIndicator';

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

const RatingTag = styled(TagChip)(() => ({
  '& span': {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingRight: '8px',
    paddingLeft: '8px',
  }
}));

const MVPTag = styled(IconTagChip)(() => ({
  '& span': {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingRight: '8px',
    paddingLeft: '8px',
  }
}))

const ColoredTableRow = styled(NoBottomBorderRow, {
  shouldForwardProp: (prop) => prop !== "teamColor"
})(({ theme, teamColor }) => {
  const color = theme.palette.mode === 'dark'
    ? teamColor.dark
    : teamColor.light;
  return {
    backgroundColor: color,
    '&:hover': {
      backgroundColor: alpha(color, '0.8')
    }
  };
});

export const PlayerTable = ({ replayInfo }) => {
  const { t } = useTranslation();
  const gameContext = useContext(GameDataContext);

  return (
    <TableContainer component={Paper} >
      <Table>
        <TableHead>
          <NoBottomBorderRow>
            {/* Link, Color, Nickname */}
            <PlayerTableHeaderCell colSpan={replayInfo.match.isMapGen ? 3 : 2}>{t('replayPlayerTablePlayerHeader')}</PlayerTableHeaderCell>
            {/* MVP Rating, MVP Icon */}
            <PlayerTableHeaderCell colSpan={2} align='center'>{t('replayPlayerTableMVPHeader')}</PlayerTableHeaderCell>
            {/* Squad */}
            <PlayerTableHeaderCell align='center'>{t('replayPlayerTableSquadHeader')}</PlayerTableHeaderCell>
            {/* Lastest Age Reached, Survival Time, Win/loose, Death, Wonder */}
            <PlayerTableHeaderCell colSpan={4} align='center'>{t('replayPlayerTableSurvivalHeader')}</PlayerTableHeaderCell>
            {/* Rating */}
            <PlayerTableHeaderCell align='right'>{t('replayPlayerTableRatingHeader')}</PlayerTableHeaderCell>
          </NoBottomBorderRow>
        </TableHead>
        <TableBody>
          {replayInfo.teams.filter(team => team.isPlayerTeam).map((team) => {
            return team.players.map((playerId) => {
              const player = replayInfo.players[playerId];
              const lastAgeResearch = player.lastAgeResearch
                ? { name: gameContext.researches[player.lastAgeResearch].name, image: gameContext.researches[player.lastAgeResearch].image }
                : { name: gameContext.units[0].nation.ir1, image: gameContext.units[0].image };
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

                  {/* MVP Rating */}
                  <PlayerTableCell align="right" sx={{ width: '30px' }}>
                    {player.mvpScore != null &&
                      <MVPTag bgColor="#bb6911" label={Number(player.mvpScore).toFixed(0)} />}
                  </PlayerTableCell>

                  {/* MVP Icon */}
                  <PlayerTableCell align="right" sx={{ px: 0, width: '18px' }}>
                    {player.isMvp &&
                      <MVPIcon fontSize='1rem'
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
                  <PlayerTableCell align="right" sx={{ width: '100px' }}>
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
                  <PlayerTableCell align="right" sx={{ maxWidth: '100%', width: '100px' }}>
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
