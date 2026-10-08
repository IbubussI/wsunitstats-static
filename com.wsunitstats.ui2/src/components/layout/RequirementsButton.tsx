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
import * as Constants from '@/utils/constants';
import { localizeNation } from '@/utils/utils';
import { InfoButtonPopper } from '@/components/common/ButtonPopper';
import { EntityInfo } from '@/components/common/EntityInfo';
import type { Requirements, ResearchRequirement } from '@/types/game';

const nbsp = (text: string) => text.replace(' ', Constants.JS_NBSP);

interface RequirementTableProps {
  label: string;
  subLabel: string;
  head: string[];
  rows: React.ReactNode[][];
}

const RequirementTable = ({ label, subLabel, head, rows }: RequirementTableProps) => (
  <Stack sx={{ marginBottom: '15px', alignItems: 'center' }}>
    <Typography sx={{ padding: '7px', paddingBottom: '0', fontSize: 19, fontWeight: 'bold' }}>
      {label}
    </Typography>
    <Typography variant='body2' sx={{ marginTop: '-4px' }}>
      {subLabel}
    </Typography>
    <TableContainer>
      <Table>
        <TableHead sx={{ '& tr th': { padding: '8px' } }}>
          <TableRow>
            {head.map((headCell, index) =>
              <TableCell key={index}>
                <Typography variant='body2' color='text.primary' sx={{ fontWeight: 'bold' }}>
                  {headCell}
                </Typography>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody sx={{ '& tr td': { padding: '6px', py: '7px' } }}>
          {rows.map((row, index) =>
            <TableRow key={index}>
              {row.map((cell, index) =>
                <TableCell key={index}>
                  {typeof cell === 'string' || typeof cell === 'number'
                    ? <Typography variant='body2' color='text.primary'>{cell}</Typography>
                    : cell}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Stack>
);

/** Button with a popper listing required units and researches, full width unless fitContent */
export const RequirementsButton = ({ requirements, fitContent }: { requirements?: Requirements; fitContent?: boolean }) => {
  const { t } = useTranslation();
  if (!requirements || !(requirements.units?.length || requirements.researchAll?.length || requirements.researchAny?.length)) {
    return null;
  }

  const researchRows = (researches: ResearchRequirement[]) => researches.map(research => [
    <EntityInfo
      primary={t(research.researchName)}
      image={research.researchImage}
      route={Constants.RESEARCH_PAGE_PATH}
      id={research.researchId}
      overflow />
  ]);
  const researchHead = [nbsp(t('requirementsResearchesResearch'))];

  return (
    <InfoButtonPopper label={t('requirementsLabel')} fitContent={fitContent}>
      {!!requirements.units?.length && <RequirementTable
        label={t('requirementsUnitsLabel')}
        subLabel={requirements.unitsAll ? t('requirementsAll') : t('requirementsOne')}
        head={[nbsp(t('requirementsUnitsUnit')), nbsp(t('requirementsUnitsQuantity'))]}
        rows={requirements.units.map(unit => [
          <EntityInfo
            primary={t(unit.unitName)}
            secondary={localizeNation(t, unit.unitNation?.name)}
            image={unit.unitImage}
            route={Constants.UNIT_PAGE_PATH}
            id={unit.unitId}
            overflow />,
          t(unit.quantityStr, { min: unit.quantityMin, max: unit.quantityMax })
        ])} />}
      {!!requirements.researchAny?.length && <RequirementTable
        label={t('requirementsResearchesLabel')}
        subLabel={t('requirementsOne')}
        head={researchHead}
        rows={researchRows(requirements.researchAny)} />}
      {!!requirements.researchAll?.length && <RequirementTable
        label={t('requirementsResearchesLabel')}
        subLabel={t('requirementsAll')}
        head={researchHead}
        rows={researchRows(requirements.researchAll)} />}
    </InfoButtonPopper>
  );
};
