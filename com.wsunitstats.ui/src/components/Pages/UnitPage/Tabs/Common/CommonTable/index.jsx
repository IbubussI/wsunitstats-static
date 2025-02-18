import * as React from 'react';
import { FlexibleTable, FlexibleTableDoubleCellRow } from 'components/Layout/FlexibleTable';
import { Stack, Typography } from '@mui/material';
import { DoubleColumnFrame } from 'components/Layout/DoubleColumnFrame';
import { ArmorChart } from 'components/Pages/UnitPage/Tabs/Common/ArmorChart';
import { TagBox } from 'components/Atoms/TagBox';
import { EntityImage } from 'components/Atoms/EntityImage';
import { useTranslation } from 'react-i18next';

const COMMON_COLUMN = 1;
const FLEX_TABLE_RIGHT_WIDTH = '50%';
const FLEX_TABLE_LEFT_WIDTH = '50%';

export const CommonTable = ({ unit, overflowMinWidth }) => {
  const { t } = useTranslation();
  const commonData = [
    createRowData(t('gameID'), unit.gameId),
    createRowData(t('commonNationCell'), t(unit.nation.name)),
    createRowData(t('commonHealthCell'), unit.health),
    createRowData(t('commonViewRangeCell'), unit.viewRange),
    createRowData(t('commonSizeCell'), unit.size),
    createRowData(t('commonRegenerationSpeedCell'), unit.regenerationSpeed, t('hpSecMarker')),

    createRowData(t('commonMovementSpeedCell'), unit.movement?.speed),
    createRowData(t('commonRotationSpeedCell'), unit.movement?.rotationSpeed),

    createRowData(t('commonTransportingSizeCell'), unit.transporting?.ownSize),
    createRowData(t('commonTransportingCapacityCell'), unit.transporting?.carrySize),
    createRowData(t('commonCanTransportCell'), unit.transporting?.carrySize ? (unit.transporting.onlyInfantry ? t('commonCanTransportInfantry') : t('commonCanTransportAll')) : null),

    createRowData(t('commonTakesPopCell'), unit.supply?.consume),
    createRowData(t('commonGivesPopulationCell'), unit.supply?.produce),
    createRowData(t('commonLimitCell'), unit.limit),

    createRowData(t(`commonReceivesFriendlyCell`), t('' + !!unit.receiveFriendlyDamage)),
    createRowData(t('commonParentNotMoveCell'), unit.parentMustIdle ? t('' + true) : null),
    createRowData(t('commonControllableCell'), t('' + !!unit.controllable)),

    createRowData(t('commonStorageEfficiencyCell'), unit.storageMultiplier && unit.storageMultiplier + '%'),

    createRowData(t('commonThreatCell'), unit.threat),
    createRowData(t('commonWeightCell'), unit.weight),
    createRowData(t('commonDeathWeaponCell'), typeof unit.weaponOnDeath === 'number' ? ('W' + unit.weaponOnDeath) : null),
  ].filter(element => element);

  const searchTagsData = {
    label: t('tagContainerSearch'),
    tags: unit.searchTags
  };

  const tagsData = {
    label: t('tagContainerUnit'),
    tags: unit.tags
  };

  return (
    <Stack spacing={0.5}>
      <DoubleColumnFrame childrenProps={[null, { overflow: 'auto', width: '100%' }]}>
        <Stack alignItems='center'>
          <h4 style={{
            marginBlockStart: '0.4em',
            marginBlockEnd: '0.65em',
            maxWidth: '150px',
            textAlign: 'center',
            wordBreak: 'break-word'
          }}>{t(unit.name)}</h4>
          <EntityImage image={unit.image} width='150px' height='150px'/>
          <Typography variant='body2' align='center' sx={{maxWidth: '150px'}}>
            {t(unit.description)}
          </Typography>
          {unit.armor?.length > 0 &&
            <>
              <h4>{t('commonArmorTitle')}</h4>
              <ArmorChart
                content={unit.armor}
                colors={[
                  'rgba(122, 16, 16, 1)',
                  'rgba(168, 87, 15, 1)',
                  'rgba(168, 116, 15, 1)',
                  'rgba(15, 132, 21, 1)',
                ]} />
            </>}
        </Stack>
        <FlexibleTable
          columns={COMMON_COLUMN}
          rows={commonData.length}
          data={commonData}
          rowHeight='max-content'
          minWidth={overflowMinWidth} />
      </DoubleColumnFrame>
      <DoubleColumnFrame childrenProps={[]} column>
        <>
          <TagBox tagsData={searchTagsData} />
          <TagBox tagsData={tagsData} />
        </>
      </DoubleColumnFrame>
    </Stack>
  );
};

function createRowData(name, valueObject, units) {
  if (valueObject != null) {
    let value = "";
    if (units) {
      value = `${valueObject} ${units}`;
    } else {
      value = valueObject.toString();
    }
    return {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: name,
        value: value,
        widthRight: FLEX_TABLE_RIGHT_WIDTH,
        widthLeft: FLEX_TABLE_LEFT_WIDTH
      }
    };
  } else {
    return null;
  }
}