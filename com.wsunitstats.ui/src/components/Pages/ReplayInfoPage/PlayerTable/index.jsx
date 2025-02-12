import * as Utils from 'utils/utils';
import {
  alpha,
  Box,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { WinnerIcon } from 'components/Pages/ReplayInfoPage/svg';
import { TagChip } from 'components/Atoms/TagChip';
import { Image } from 'components/Atoms/Renderer';

const PlayerTableCell = styled(TableCell)(({ theme }) => ({
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

export const PlayerTable = ({ replayInfo, defaultAgeImage }) => {
  return (
    <TableContainer component={Paper} >
      <Table>
        <TableBody>
          {replayInfo.teams.filter(team => team.isPlayerTeam).map((team) => {
            return team.players.map((playerId) => {
              const player = replayInfo.players[playerId];
              const lastAgeResearch = player.lastAgeResearch
                ? player.lastAgeResearch.researchContext.image
                : defaultAgeImage; // take altar in case there are no units
              return (
                <TableRow key={player.id} sx={{
                  backgroundColor: team.color,
                  '&:hover': {
                    backgroundColor: alpha(team.color, '0.8')
                  },
                }}>
                  {/* Color */}
                  <PlayerTableCell align="center" sx={{ width: 0 }}>
                    <Box sx={{
                      backgroundColor: player.color,
                      height: '18px',
                      width: '18px',
                      borderRadius: '15%',
                      boxShadow: '0 0 3px #0000008a'
                    }} />
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
                    {player.group && `Squad-${player.group}`}
                  </PlayerTableCell>

                  {/* Lastest Age Reached */}
                  <PlayerTableCell align="right" sx={{
                    width: '60px',
                    lineHeight: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                  }}>
                    <Image path={lastAgeResearch}
                      width={25}
                      height={25} />
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
                      <WinnerIcon sx={{ width: '20px', height: '20px', display: 'block' }} />}
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
                </TableRow>
              );
            });
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
