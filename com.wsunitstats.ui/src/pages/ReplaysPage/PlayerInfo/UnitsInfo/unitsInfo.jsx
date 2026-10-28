import * as Utils from '@/utils/utils';
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
  TableRow,
  Typography
} from '@mui/material';
import React from 'react';
import { useGameContext } from '@/store/gameDataStore';
import * as Constants from '@/utils/constants';
import { NoBottomBorderRow } from '@/components/common/misc';
import { EntityInfo } from '@/components/common/EntityInfo';
import { useTranslation } from 'react-i18next';
import { TagChip } from '@/components/common/TagChip';
import { MVP_CONST } from '@/pages/ReplaysPage/ReplayInfo/scoreCalculator';
import { useSearchParams } from 'react-router-dom';

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

/** Total number of units in a list of unit stats */
export const countUnits = (units) => units.reduce((sum, unit) => sum + unit.number, 0);

/** Total number of units in a map of category to unit stats */
export const countAllUnits = (unitStatsMap) => Array.from(unitStatsMap.values()).reduce((sum, units) => sum + countUnits(units), 0);

export const UnitsInfo = ({ unitStatsMap }) => {
  const gameContext = useGameContext();
  const unitsById = React.useMemo(() => new Map(gameContext.units.map(unit => [unit.gameId, unit])), [gameContext.units]);

  const columns = React.useMemo(() => {
    const elements = Array.from(unitStatsMap.entries()
      .map(entry => ({ data: entry, num: entry[1].length + 1 }))
      .map(entry => {
        const units = entry.data[1];
        units.forEach(unit => {
          unit.context = unitsById.get(unit.id);
        });
        units.sort((u1, u2) => u1.context.nationId - u2.context.nationId);
        return entry;
      }));
  
    const sortedElements = elements.sort((el1, el2) => el2.num - el1.num);
    const largest = sortedElements[0].num;
    const rest = sortedElements.slice(1).reduce((acc, el) => acc + el.num, 0);
    // split big column if there is any
    if (largest >= (rest + 3) && rest > 0) {
      const sliceIndex = Math.floor(largest / 2);
      const array1 = sortedElements[0].data[1].slice(0, sliceIndex);
      const array2 = sortedElements[0].data[1].slice(sliceIndex);
      sortedElements[0] = { data: [sortedElements[0].data[0], array1], num: array1.length + 1 };
      sortedElements.push({ data: [sortedElements[0].data[0], array2], num: array2.length + 1 });
    }

    return Utils.solvePartitioning(sortedElements, 3);
  }, [unitStatsMap, unitsById]);

  return (
    <Stack direction="row" gap={1} sx={{ overflowX: 'auto', p: 0.5 }}>
      {columns.reverse().map((column, i) => (
        column.length > 0 &&
        <Stack key={i} sx={{ flex: 1, maxWidth: 276 }} gap={1}>
          {column.map((entry, j) => (
            <UnitsSingleColumn key={j} units={entry.data[1]} category={entry.data[0]}
              categoryTotal={countUnits(unitStatsMap.get(entry.data[0]))} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
};

// a big category may be split into two columns, both show the total of the whole category
const UnitsSingleColumn = ({ units, category, categoryTotal }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isDebug = searchParams.get('debug') || false;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell align="center" colSpan={2} sx={{ position: 'relative' }}>
              {t(category)}
              <Typography variant="caption" color="text.secondary"
                sx={{ position: 'absolute', right: '8px', bottom: '2px', lineHeight: 1.2 }}>
                {t('unitsInfoCategoryTotal', { value: categoryTotal })}
              </Typography>
            </HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {units.map((unit) => {
            const unitContext = unit.context;
            return (
              <NoBottomBorderRow key={unit.id} hover sx={{ position: 'relative' }}>
                <BodyCell>
                  {isDebug && <UnitScorePointsDebug num={unit.number} killValue={unitContext.killValue} />}
                  <EntityInfo
                    clearLinkStyle
                    primary={t(unitContext.name)}
                    secondary={Utils.localizeNation(t, unitContext.nation)}
                    image={unitContext.image}
                    route={Constants.UNIT_PAGE_PATH}
                    id={unitContext.gameId}
                    overflow />
                </BodyCell>
                <BodyCell align='right'>
                  <NumberTag label={unit.number} />
                </BodyCell>
              </NoBottomBorderRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const UnitScorePointsDebug = ({ num, killValue }) => (
  <div style={{ position: 'absolute', right: '50px', fontSize: '11px' }}>
    {(num * killValue * MVP_CONST.unitKillK).toFixed(1)}
  </div>
);
