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
import React, { useContext } from 'react';
import { GameDataContext } from 'gameDataContext';
import { NoBottomBorderRow } from 'components/Atoms/Table';
import { EntityInfo } from 'components/Atoms/Renderer';
import { useTranslation } from 'react-i18next';
import { TagChip } from 'components/Atoms/TagChip';

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
  const gameContext = useContext(GameDataContext);

  const columns = React.useMemo(() => {
    const elements = Array.from(unitStatsMap.entries()
      .map(entry => ({ data: entry, num: entry[1].length + 1 }))
      .map(entry => {
        const units = entry.data[1];
        units.forEach(unit => {
          const unitContext = gameContext.units[unit.id];
          unit.context = unitContext;
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
  }, [unitStatsMap, gameContext.units]);

  return (
    <Stack direction="row" gap={1} sx={{ overflowX: 'auto', p: 0.5 }}>
      {columns.reverse().map((column, i) => (
        column.length > 0 &&
        <Stack key={i} sx={{ flex: 1, maxWidth: 276 }} gap={1}>
          {column.map((entry, j) => (
            <UnitsSingleColumn key={j} units={entry.data[1]} category={entry.data[0]} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
};

const UnitsSingleColumn = ({ units, category }) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell align="center" colSpan={2}>
              {t(category)}
            </HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {units.map((unit) => {
            const unitContext = unit.context;
            return (
              <NoBottomBorderRow key={unit.id} hover>
                <BodyCell>
                  <EntityInfo
                    clearLinkStyle
                    data={{
                      primary: t(unitContext.name),
                      secondary: unitContext.nation && Utils.localizeNation(t, unitContext.nation),
                      image: {
                        path: unitContext.image,
                        width: 35,
                        height: 35,
                      },
                      link: {
                        id: unitContext.gameId,
                        path: Utils.getEntityRoute('unit')
                      },
                      overflow: true
                    }} />
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
