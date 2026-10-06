import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { withUnits } from '@/utils/utils';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { DamageTable } from '@/components/layout/KeyValueTable';
import { HeaderChip } from '@/components/common/HeaderChip';
import type { Unit, Weapon } from '@/types/game';
import { BuffButton, EnvButton, AttackButton, DamageAreaValue, RangeValue } from './damage';
import { TabLayout } from './TabLayout';

const MIN_WIDTH = 340;

export const WeaponsTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  return (
    <TabLayout title={t('weaponsTitle')} minWidth={MIN_WIDTH} columnWidth={570}>
      {unit.weapons?.map((weapon) =>
        <WeaponTable key={`W${weapon.weaponId}`} weapon={weapon} />
      )}
      {unit.turrets?.flatMap((turret) => turret.weapons.map((weapon) =>
        <WeaponTable key={`T${turret.turretId}-${weapon.weaponId}`}
          weapon={weapon}
          turretId={turret.turretId}
          turretRotationSpeed={turret.rotationSpeed} />
      ))}
    </TabLayout>
  );
};

interface WeaponTableProps {
  weapon: Weapon;
  turretId?: number;
  turretRotationSpeed?: number;
}

const WeaponTable = ({ weapon, turretId, turretRotationSpeed }: WeaponTableProps) => {
  const { t } = useTranslation();
  const isTurret = turretId != null;
  const damage = weapon.damage;
  const attacksNumber = damage.damagesCount * weapon.attacksPerAttack * weapon.attacksPerAction;
  const bool = (value?: boolean) => t(String(!!value));
  const seconds = (value?: number) => withUnits(value, t(Constants.SECONDS_END_MARKER));
  const disabled = weapon.enabled === false;

  const rows = [
    { column: 1, label: t('weaponReloadCell'), value: seconds(weapon.rechargePeriod) },
    { column: 1, label: t('weaponSpreadCell'), value: weapon.spread ? weapon.spread + `${Constants.JS_NBSP}%` : null },
    { column: 1, label: t('damageAreaCell'), value: <DamageAreaValue damage={damage} /> },
    { column: 1, label: t('weaponRangeCell'), value: <RangeValue distance={weapon.distance} /> },
    { column: 2, label: t('weaponRotationSpeedCell'), value: turretRotationSpeed },
    { column: 2, label: t('damageFriendlyCell'), value: bool(damage.damageFriendly) },
    { column: 2, label: t('weaponGroundAttackCell'), value: bool(weapon.attackGround) },
    { column: 2, label: t('weaponAutoAttackCell'), value: bool(weapon.autoAttack) },
  ];

  return (
    <Frame disabled={disabled} labelShift='80px' label={
      <HeaderChip
        id={isTurret ? 'T' + turretId : 'W' + weapon.weaponId}
        tooltip={isTurret
          ? t('weaponsTurretTooltipID', { value: turretId })
          : t('weaponsWeaponTooltipID', { value: weapon.weaponId })}
        label={t(weapon.weaponType)}
        disabled={disabled} />
    }>
      <FrameSection sx={{ paddingTop: '14px' }}>
        <DamageTable damages={damage.damages} attacksNumber={attacksNumber} />
        <Stack sx={{ width: '100%', gap: '5px', padding: '5px', boxSizing: 'border-box' }}>
          <AttackButton weapon={weapon} />
          <BuffButton buff={damage.buff} />
          <EnvButton damage={damage} />
        </Stack>
      </FrameSection>
      <FrameSection sx={{ overflow: 'auto', width: '100%' }}>
        <StatTable rows={rows} columns={2} labelWidth='48%' minWidth={MIN_WIDTH} />
      </FrameSection>
    </Frame>
  );
};
