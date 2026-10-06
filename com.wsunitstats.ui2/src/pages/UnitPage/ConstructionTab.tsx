import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { localizeNation } from '@/utils/utils';
import { GridGroup, ResizableGrid } from '@/components/layout/ResizableGrid';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { EntityInfo } from '@/components/common/EntityInfo';
import { HeaderChip } from '@/components/common/HeaderChip';
import type { Construction, Unit } from '@/types/game';

export const ConstructionTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t('constructionTitle')}</h3>
      <ResizableGrid minWidth={250}>
        <GridGroup columnWidth={500}>
          {unit.construction?.map((construction) =>
            <ConstructionTable key={construction.constructionId} construction={construction} />)}
        </GridGroup>
        <GridGroup columnWidth={500}>
          <Typography variant="caption" color="text.secondary">
            {t('constructionNote')}
          </Typography>
        </GridGroup>
      </ResizableGrid>
    </>
  );
};

const ConstructionTable = ({ construction }: { construction: Construction }) => {
  const { t } = useTranslation();
  const entity = construction.entityInfo;
  const rows = [
    {
      label: t('abilitiesTargetCell'),
      value: entity && <EntityInfo
        primary={t(entity.entityName)}
        secondary={localizeNation(t, entity.entityNation?.name)}
        image={entity.entityImage}
        route={Constants.UNIT_PAGE_PATH}
        id={entity.entityId}
        overflow />
    },
    { label: t('constructionDistanceCell'), value: construction.distance },
    {
      label: t('constructionConstructionSpeedCell'),
      value: construction.constructionSpeed != null
        ? t('constructionConstructionSpeedValue', { value: construction.constructionSpeed })
        : null
    },
  ];

  return (
    <Frame labelShift='21%' label={
      <HeaderChip
        id={construction.constructionId}
        tooltip={t('constructionTooltipID', { value: construction.constructionId })} />
    }>
      <FrameSection sx={{ width: '100%' }}>
        <StatTable rows={rows} labelWidth='35%' minWidth={200} />
      </FrameSection>
    </Frame>
  );
};
