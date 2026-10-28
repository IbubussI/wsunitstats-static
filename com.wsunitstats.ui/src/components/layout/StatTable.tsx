import * as React from 'react';
import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';
import { isPresent } from '@/utils/utils';

export interface StatRow {
  label: React.ReactNode;
  /** row is not shown if the value is null, undefined or empty string */
  value: React.ReactNode;
  /** 1-based column number (default - 1) */
  column?: number;
}

interface StatTableProps {
  rows: StatRow[];
  columns?: number;
  /** width of the label part of a cell, value takes the rest */
  labelWidth?: string;
  minWidth?: number;
}

const textOrNode = (value: React.ReactNode) =>
  typeof value === 'string' || typeof value === 'number'
    ? <Typography variant='body2' color='text.primary'>{value}</Typography>
    : value;

/** Striped label-value grid, filled column by column */
export const StatTable = ({ rows, columns = 1, labelWidth = '50%', minWidth }: StatTableProps) => {
  const theme = useTheme();
  const columnRows: StatRow[][] = Array.from({ length: columns }, () => []);
  rows.filter(row => isPresent(row.value))
    .forEach(row => columnRows[(row.column ?? 1) - 1].push(row));
  const rowCount = Math.max(...columnRows.map(column => column.length));
  if (rowCount === 0) {
    return null;
  }

  return (
    <Box sx={{
      minWidth,
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rowCount}, auto)`,
      width: '100%',
      '& > *:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.2) }
    }}>
      {columnRows.flatMap((column, columnIndex) =>
        Array.from({ length: rowCount }, (_, rowIndex) => {
          const row = column[rowIndex];
          return (
            <Stack
              key={`${columnIndex}-${rowIndex}`}
              direction='row'
              sx={{
                gridColumn: columnIndex + 1,
                gridRow: rowIndex + 1,
                minHeight: '45px',
                overflow: 'hidden',
                backgroundColor: rowIndex % 2 === 0 ? theme.palette.action.hover : undefined
              }}>
              {row && <>
                <Stack justifyContent='center' sx={{ width: labelWidth, pl: '7px' }}>
                  {textOrNode(row.label)}
                </Stack>
                <Stack justifyContent='center' sx={{ flex: 1, minWidth: 0, pl: '7px' }}>
                  {textOrNode(row.value)}
                </Stack>
              </>}
            </Stack>
          );
        }))}
    </Box>
  );
};
