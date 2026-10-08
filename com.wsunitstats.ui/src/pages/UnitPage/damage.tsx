import { useTranslation } from 'react-i18next';
import * as Constants from '@/utils/constants';
import { isPresent, withUnits } from '@/utils/utils';
import { InfoButtonPopper } from '@/components/common/ButtonPopper';
import { EntityInfo } from '@/components/common/EntityInfo';
import { SubValue } from '@/components/common/misc';
import { TagList } from '@/components/common/TagBox';
import { KeyValueTable, type KeyValueRow } from '@/components/layout/KeyValueTable';
import type { Buff, DamageWrapper, Distance, Weapon } from '@/types/game';

/** "label: value, label: value" of present values */
const joinLabeled = (entries: { label: string; value?: number }[]) =>
  entries.filter(entry => entry.value)
    .map(entry => `${entry.label}:${Constants.JS_NBSP}${entry.value}`)
    .join(', ');

export const DamageAreaValue = ({ damage }: { damage: DamageWrapper }) => {
  const { t } = useTranslation();
  return (
    <SubValue
      primary={t(damage.areaType)}
      sub={joinLabeled([
        { label: t('damageAreaCellRadius'), value: damage.radius },
        { label: t('damageAreaCellAngle'), value: damage.angle }
      ])} />
  );
};

export const RangeValue = ({ distance }: { distance: Distance }) => {
  const { t } = useTranslation();
  return (
    <SubValue
      primary={distance.min ? distance.min + '...' + distance.max : distance.max}
      sub={joinLabeled([{ label: t('weaponRangeCellStop'), value: distance.stop }])} />
  );
};

/** Popper button with a table, not shown if all values are empty */
const InfoTableButton = ({ label, rows }: { label: string; rows: KeyValueRow[] }) => {
  if (!rows.some(row => isPresent(row.value))) {
    return null;
  }
  return (
    <InfoButtonPopper label={label}>
      <KeyValueTable label={label} tableLayout='fixed' rows={rows} />
    </InfoButtonPopper>
  );
};

export const AttackButton = ({ weapon }: { weapon: Weapon }) => {
  const { t } = useTranslation();
  const seconds = (value?: number) => withUnits(value, t(Constants.SECONDS_END_MARKER));
  return (
    <InfoTableButton label={t('attackInfoLabel')} rows={[
      { label: t('attackAmmoCell'), value: weapon.charges },
      { label: t('attackDPPCell'), value: weapon.damage.damagesCount },
      { label: t('attackDPACell'), value: weapon.attacksPerAttack },
      { label: t('attackAPACell'), value: weapon.attacksPerAction },
      { label: t('attackDelayCell'), value: seconds(weapon.attackDelay) },
      { label: t('attackTimeCell'), value: seconds(weapon.attackTime) },
      { label: t('attackShotTimeCell'), value: seconds(weapon.avgShotTime) },
    ]} />
  );
};

export const BuffButton = ({ buff }: { buff?: Buff }) => {
  const { t } = useTranslation();
  if (!buff) {
    return null;
  }
  return (
    <InfoTableButton label={t('buffInfoLabel')} rows={[
      {
        label: t('buffCell'),
        value: buff.entityInfo && <EntityInfo
          primary={t(buff.entityInfo.entityName)}
          image={buff.entityInfo.entityImage}
          route={Constants.RESEARCH_PAGE_PATH}
          id={buff.entityInfo.entityId}
          overflow />
      },
      { label: t('buffDuration'), value: withUnits(buff.period, t(Constants.SECONDS_END_MARKER)) },
      {
        label: t('buffAffectedUnits'),
        labelBaseline: true,
        value: buff.affectedUnits?.length ? <TagList tags={buff.affectedUnits} /> : null
      }
    ]} />
  );
};

export const EnvButton = ({ damage }: { damage: DamageWrapper }) => {
  const { t } = useTranslation();
  return (
    <InfoTableButton label={t('envInfoLabel')} rows={[
      { label: t('envDamageCell'), value: damage.envDamage },
      {
        label: t('envCanDamageCell'),
        labelBaseline: true,
        value: damage.envsAffected?.length ? <TagList tags={damage.envsAffected} /> : null
      }
    ]} />
  );
};
