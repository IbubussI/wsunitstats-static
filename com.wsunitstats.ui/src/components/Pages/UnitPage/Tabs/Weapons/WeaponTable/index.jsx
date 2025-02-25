import * as React from 'react';
import * as Data from "data";
import { Stack } from '@mui/material';
import { FlexibleTable } from 'components/Layout/FlexibleTable';
import { HeaderChip } from 'components/Atoms/Renderer';
import { DoubleColumnTable } from 'components/Layout/DoubleColumnTable';
import { InfoButtonPopper } from "components/Atoms/ButtonPopper";
import { DoubleColumnFrame } from 'components/Layout/DoubleColumnFrame';
import { useTranslation } from 'react-i18next';

const STATS_COLUMNS = 2;
const STATS_ROWS = 5;
const FLEX_TABLE_RIGHT_WIDTH = '52%';
const FLEX_TABLE_LEFT_WIDTH = '48%';
 
export const WeaponTable = ({ item, overflowMinWidth }) => {
  const { t } = useTranslation();
  const weapon = item.weapon;
  
  const attacksNumber = weapon.damage.damagesCount * weapon.attacksPerAttack * weapon.attacksPerAction;
  const damagesData = Data.getDamagesData(weapon.damage.damages, attacksNumber, t);
  const attackData = Data.getAttackData(weapon, t);
  const buffData = Data.getBuffData(weapon.damage.buff, t);
  const envData = Data.getEnvData(weapon.damage, t);
  const weaponData = Data.getWeaponData(weapon, item.turretRotationSpeed, FLEX_TABLE_RIGHT_WIDTH, FLEX_TABLE_LEFT_WIDTH, t);

  const disabled = weapon.enabled === false && 'disabled';
  const labelData = {
    value: {
      tooltip: item.isTurret ? t('weaponsTurretTooltipID', { value: item.turretId }) : t('weaponsWeaponTooltipID', { value: weapon.weaponId }),
      id: item.isTurret ? "T" + item.turretId : "W" + weapon.weaponId,
      label: t(weapon.weaponType),
      disabled: disabled
    },
    valueRenderer: HeaderChip,
    shift: '80px'
  }

  return (
    <DoubleColumnFrame childrenProps={[{ paddingTop: '14px'}, { overflow: 'auto', width: '100%' }]} borderLabel={labelData} disabled={disabled}>
      <>
        <DoubleColumnTable data={damagesData} />
        <Stack sx={{
          width: '100%',
          gap: '5px',
          padding: '5px',
          boxSizing: 'border-box'
        }}>
          {attackData.content.length > 0 && <InfoButtonPopper label={attackData.label}>
            <DoubleColumnTable data={attackData} />
          </InfoButtonPopper>}
          {buffData.content?.length > 0 && <InfoButtonPopper label={buffData.label}>
            <DoubleColumnTable data={buffData} />
          </InfoButtonPopper>}
          {envData.content.length > 0 && <InfoButtonPopper label={envData.label}>
            <DoubleColumnTable data={envData} />
          </InfoButtonPopper>}
        </Stack>
      </>

      <FlexibleTable
        columns={STATS_COLUMNS}
        rows={STATS_ROWS}
        data={weaponData}
        rowHeight='max-content'
        minWidth={overflowMinWidth} />
    </DoubleColumnFrame>
  );
}