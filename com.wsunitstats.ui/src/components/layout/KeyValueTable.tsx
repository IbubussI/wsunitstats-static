import * as React from 'react';
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Image } from '@/components/common/Image';
import { isPresent } from '@/utils/utils';
import type { Damage, Resource } from '@/types/game';

export interface KeyValueRow {
  label: React.ReactNode;
  value: React.ReactNode;
  /** align label to the first line of a multiline value */
  labelBaseline?: boolean;
}

interface KeyValueTableProps {
  label?: React.ReactNode;
  rows: KeyValueRow[];
  width?: string;
  rightWidth?: string;
  tableLayout?: 'auto' | 'fixed';
  firstRowPaddingTop?: string;
  rowPadding?: string;
  /** render rows after the first one smaller and secondary colored */
  secondaryRows?: boolean;
}

/** Two column table: label - value. Rows with empty value are skipped */
export const KeyValueTable = ({
  label,
  rows,
  width = 'max-content',
  rightWidth,
  tableLayout = 'auto',
  firstRowPaddingTop = '10px',
  rowPadding = '4px',
  secondaryRows
}: KeyValueTableProps) => {
  const visibleRows = rows.filter(row => isPresent(row.value));
  return (
    <TableContainer>
      <Table sx={{ tableLayout, width }}>
        {label && <TableHead sx={{ '& tr th': { py: '7px' } }}>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant='body2' color='text.primary'>
                {label}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>}
        <TableBody>
          {visibleRows.map((row, index) => {
            const isSecondary = secondaryRows && index > 0;
            const variant = isSecondary ? 'caption' : 'body2';
            const color = isSecondary ? 'text.secondary' : 'text.primary';
            return (
              <TableRow key={index} sx={{
                '& td': {
                  px: '7px',
                  paddingTop: index === 0 ? firstRowPaddingTop : rowPadding,
                  paddingBottom: rowPadding,
                  border: 0,
                }
              }}>
                <TableCell sx={{ verticalAlign: row.labelBaseline ? 'baseline' : undefined }}>
                  <Typography variant={variant} color={color}>
                    {row.label}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: rightWidth }}>
                  {typeof row.value === 'string' || typeof row.value === 'number'
                    ? <Typography variant={variant} color={color}>{row.value}</Typography>
                    : row.value}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface DamageTableProps {
  damages?: Damage[];
  /** number of hits, shown as multiplier of the damage value */
  attacksNumber: number;
  width?: string;
}

/** Damage values by target tag; the first one (base damage) is highlighted */
export const DamageTable = ({ damages = [], attacksNumber, width = '150px' }: DamageTableProps) => {
  const { t } = useTranslation();
  return (
    <KeyValueTable
      label={t('damagesLabel')}
      width={width}
      rightWidth='47px'
      firstRowPaddingTop='5px'
      rowPadding='0px'
      secondaryRows
      rows={damages.map(damage => ({
        label: t(damage.type),
        value: attacksNumber > 1 && damage.value > 0 ? attacksNumber + 'x' + damage.value : damage.value
      }))} />
  );
};

interface CostTableProps {
  label: React.ReactNode;
  cost: Resource[];
}

export const CostTable = ({ label, cost }: CostTableProps) => {
  const { t } = useTranslation();
  return (
    <KeyValueTable
      label={label}
      width='150px'
      rightWidth='71px'
      firstRowPaddingTop='5px'
      rowPadding='0px'
      rows={cost.map(resource => ({
        label: t(resource.resourceName),
        value: (
          <Stack direction='row' alignItems='center'>
            <Image path={resource.image} width={24} height={24} sx={{ marginRight: 0.4 }} />
            <Typography variant='body2' color='text.primary'>
              {resource.value}
            </Typography>
          </Stack>
        )
      }))} />
  );
};
