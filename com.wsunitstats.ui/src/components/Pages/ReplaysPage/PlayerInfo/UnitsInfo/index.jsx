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

export const UnitsInfo = ({ unitsCreated }) => {
  const workers = unitsCreated.get(workerKey);
  const land = unitsCreated.get(landKey);
  const air = unitsCreated.get(airKey);
  const fleet = unitsCreated.get(fleetKey);
  const prodBuildings = unitsCreated.get(prodBuildKey);
  const defBuildings = unitsCreated.get(defBuildKey);
  const ecoBuildings = unitsCreated.get(ecoBuildKey);
  const gameplayBuildings = unitsCreated.get(gameplayBuildKey);
  const other = unitsCreated.get(otherKey);
  return (
    <Stack direction="row" gap={1} sx={{ overflowX: 'auto', p: 0.5 }}>
      <Stack sx={{ flex: 1 }} gap={1}>
        <UnitsTable unitsCreated={ecoBuildings} category={ecoBuildKey} />
        <UnitsTable unitsCreated={workers} category={workerKey} />
      </Stack>
      <Stack sx={{ flex: 1 }} gap={1}>
        <UnitsTable unitsCreated={prodBuildings} category={prodBuildKey} />
        <UnitsTable unitsCreated={defBuildings} category={defBuildKey} />
        <UnitsTable unitsCreated={gameplayBuildings} category={gameplayBuildKey} />
      </Stack>
      <Stack sx={{ flex: 1 }} gap={1}>
        <UnitsTable unitsCreated={land} category={landKey} />
        <UnitsTable unitsCreated={air} category={airKey} />
        <UnitsTable unitsCreated={fleet} category={fleetKey} />
        <UnitsTable unitsCreated={other} category={otherKey} />
      </Stack>
    </Stack>
  );
};

const UnitsTable = ({ unitsCreated, category }) => {
  const gameContext = useContext(GameDataContext);
  const { t } = useTranslation();

  return unitsCreated
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
          {unitsCreated.map((unitCreated) => {
            const unit = gameContext.units[unitCreated.id];
            return (
              <NoBottomBorderRow key={unitCreated.id} hover>
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
                  <NumberTag label={unitCreated.number} />
                </BodyCell>
              </NoBottomBorderRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
    : null;
};
