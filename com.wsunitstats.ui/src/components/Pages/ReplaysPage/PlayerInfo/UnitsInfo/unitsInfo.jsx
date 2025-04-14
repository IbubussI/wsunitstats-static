import * as Utils from 'utils/utils';
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
  TableRow
} from '@mui/material';
import { useContext } from 'react';
import { GameDataContext } from 'gameDataContext';
import { NoBottomBorderRow } from 'components/Atoms/Table';
import { EntityInfo } from 'components/Atoms/Renderer';
import { useTranslation } from 'react-i18next';
import { TagChip } from 'components/Atoms/TagChip';

const workerKey = 'unitCategoryWorker';
const landKey = 'unitCategoryLand';
const airKey = 'unitCategoryAir';
const fleetKey = 'unitCategoryFleet';
const prodBuildKey = 'unitCategoryProdBuild';
const defBuildKey = 'unitCategoryDefBuild';
const ecoBuildKey = 'unitCategoryEcoBuild';
const gameplayBuildKey = 'unitCategoryGameplayBuild';
const otherKey = 'unitCategoryOther';

const HeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  padding: '8px'
}));

const BodyCell = styled(TableCell)(() => ({
  padding: '6px'
}));

const NumberTag = styled(TagChip)(() => ({
  '& span': {
    fontSize: '12px',
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingRight: '10px',
    paddingLeft: '10px',
  }
}));

export const UnitsInfo = ({ unitStatsMap }) => {
  const workers = unitStatsMap.get(workerKey);
  const land = unitStatsMap.get(landKey);
  const air = unitStatsMap.get(airKey);
  const fleet = unitStatsMap.get(fleetKey);
  const prodBuildings = unitStatsMap.get(prodBuildKey);
  const defBuildings = unitStatsMap.get(defBuildKey);
  const ecoBuildings = unitStatsMap.get(ecoBuildKey);
  const gameplayBuildings = unitStatsMap.get(gameplayBuildKey);
  const other = unitStatsMap.get(otherKey);

  const isCol1 = ecoBuildings || workers;
  const isCol2 = prodBuildings || defBuildings || gameplayBuildings;
  const isCol3 = land || air || fleet || other;
  return (
    <Stack direction="row" gap={1} sx={{ overflowX: 'auto', p: 0.5 }}>
      {isCol1 && <Stack sx={{ flex: 1, maxWidth: 276 }} gap={1}>
        <UnitsTable unitStats={ecoBuildings} category={ecoBuildKey} />
        <UnitsTable unitStats={workers} category={workerKey} />
      </Stack>}
      {isCol2 && <Stack sx={{ flex: 1, maxWidth: 276 }} gap={1}>
        <UnitsTable unitStats={prodBuildings} category={prodBuildKey} />
        <UnitsTable unitStats={defBuildings} category={defBuildKey} />
        <UnitsTable unitStats={gameplayBuildings} category={gameplayBuildKey} />
      </Stack>}
      {isCol3 && <Stack sx={{ flex: 1, maxWidth: 276 }} gap={1}>
        <UnitsTable unitStats={land} category={landKey} />
        <UnitsTable unitStats={air} category={airKey} />
        <UnitsTable unitStats={fleet} category={fleetKey} />
        <UnitsTable unitStats={other} category={otherKey} />
      </Stack>}
    </Stack>
  );
};

const UnitsTable = ({ unitStats, category }) => {
  const gameContext = useContext(GameDataContext);
  const { t } = useTranslation();

  return unitStats
    ? <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell align="center" colSpan={2}>
              {t(category)}
            </HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {unitStats.map((unitStats) => {
            const unit = gameContext.units[unitStats.id];
            return (
              <NoBottomBorderRow key={unitStats.id} hover>
                <BodyCell>
                  <EntityInfo
                    clearLinkStyle
                    data={{
                      primary: t(unit.name),
                      secondary: unit.nation && Utils.localizeNation(t, unit.nation),
                      image: {
                        path: unit.image,
                        width: 35,
                        height: 35,
                      },
                      link: {
                        id: unit.gameId,
                        path: Utils.getEntityRoute('unit')
                      },
                      overflow: true
                    }} />
                </BodyCell>
                <BodyCell align='right'>
                  <NumberTag label={unitStats.number} />
                </BodyCell>
              </NoBottomBorderRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
    : null;
};
