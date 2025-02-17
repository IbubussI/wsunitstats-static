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
  Tooltip,
} from '@mui/material';
import { WinnerIcon } from 'components/Pages/ReplaysPage/ReplayInfo/svg';
import { TagChip } from 'components/Atoms/TagChip';
import { Image } from 'components/Atoms/Renderer';
import { useTranslation } from 'react-i18next';
import { NoBottomBorderRow } from 'components/Atoms/Table';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const PlayerTableCell = styled(TableCell)(({ theme }) => ({
  borderColor: alpha(theme.palette.grey[700], 0.6),
  fontSize: theme.typography.body2.fontSize,
  padding: theme.spacing(0.8)
}));

const RatingTag = styled(TagChip)(() => ({
  '& span': {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingRight: '8px',
    paddingLeft: '8px',
  }
}));

const TEAM_COLORS = {
  dark: [
    "#5a3d3d",
    "#3b5158"
  ],
  light: [
    "#ffa2a2",
    "#a2d8ff"
  ]
}

const ColoredTableRow = styled(NoBottomBorderRow, {
  shouldForwardProp: (prop) => prop !== "teamColor"
})(({ theme, teamColor }) => {
  const color = theme.palette.mode === 'dark'
    ? TEAM_COLORS.dark[teamColor]
    : TEAM_COLORS.light[teamColor];
  return {
    backgroundColor: color,
    '&:hover': {
      backgroundColor: alpha(color, '0.8')
    }
  }
});

export const PlayerTable = ({ replayInfo }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onPlayerInfo = React.useCallback((playerId) => {
    navigate(Utils.getUrlWithPathParams([
      { param: Constants.REPLAY_PLAYER_INFO_PAGE_PATH, pos: 4 },
      { param: playerId, pos: 5 }
    ]), { replace: false });
  }, [navigate]);

  return (
    <TableContainer component={Paper} >
      <Table>
        <TableBody>
          {replayInfo.teams.filter(team => team.isPlayerTeam).map((team) => {
            return team.players.map((playerId) => {
              const player = replayInfo.players[playerId];
              return (
                <ColoredTableRow key={player.id} teamColor={team.color}>
                  {/* Link - temporary hidden until implementation is ready*/}
                  {false && <PlayerTableCell align="left" sx={{ width: '36px', height: '36px', py: 0.3, px: 0.4 }}>
                    <Button onClick={() => onPlayerInfo(player.id)} sx={{ p: 0.3, minWidth: '0px' }}>
                      <OpenInNewIcon />
                    </Button>
                  </PlayerTableCell>}
                  {/* Color */}
                  <PlayerTableCell align="center" sx={{ width: '31px' }}>
                  {replayInfo.match.isMapGen && <Box sx={{
                      backgroundColor: player.color,
                      height: '18px',
                      width: '18px',
                      borderRadius: '15%',
                      boxShadow: '0 0 3px #0000008a'
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

                  {/* Squad */}
                  <PlayerTableCell align="right" sx={{ width: '80px' }}>
                    {player.group && t('replaySquad', { value: player.group })}
                  </PlayerTableCell>

                  {/* Lastest Age Reached */}
                  <PlayerTableCell align="right" sx={{
                    width: '60px',
                    lineHeight: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                  }}>
                    {player.lastAge &&
                      <Tooltip title={t(player.lastAge.name)}
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
                        <Image path={player.lastAge.image}
                          width={25}
                          height={25} />
                      </Tooltip>}
                  </PlayerTableCell>

                  {/* Survival Time */}
                  <PlayerTableCell align="right" sx={{ width: '80px' }}>
                    {player.isDead && Utils.formatDuration(player.survivalTime)}
                  </PlayerTableCell>

                  {/* Win/Death */}
                  <PlayerTableCell align="center" sx={{
                    width: '18px',
                    paddingRight: 0,
                    paddingLeft: 0
                  }}>
                    {player.isDead &&
                      <i className="fa-solid fa-skull fa-lg" style={{ color: '#dd1d1dd4' }}></i>}
                    {player.isWinner &&
                      <WinnerIcon sx={{
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
