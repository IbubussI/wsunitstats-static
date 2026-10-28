import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import * as Constants from '@/utils/constants';
import { getAbilityRoute, localizeNation, withUnits } from '@/utils/utils';
import { GridGroup, ResizableGrid } from '@/components/layout/ResizableGrid';
import { Frame, FrameSection } from '@/components/layout/Frame';
import { StatTable } from '@/components/layout/StatTable';
import { CostTable, DamageTable } from '@/components/layout/KeyValueTable';
import { RequirementsButton } from '@/components/layout/RequirementsButton';
import { EntityInfo } from '@/components/common/EntityInfo';
import { HeaderChip } from '@/components/common/HeaderChip';
import {
  CONTAINER_TYPE_DEATH,
  CONTAINER_TYPE_WORK,
  type Ability,
  type AbilityContainer,
  type Unit
} from '@/types/game';
import { BuffButton, DamageAreaValue, EnvButton } from './damage';

const MIN_WIDTH = 280;

const ABILITY_NAMES: Record<number, string> = {
  [Constants.ABILITY_TYPE_CREATE_UNIT]: 'abilityCreateUnit',
  [Constants.ABILITY_TYPE_RESEARCH]: 'abilityResearch',
  [Constants.ABILITY_TYPE_TRANSFORM]: 'abilityTransform',
  [Constants.ABILITY_TYPE_CREATE_ENV]: 'abilityCreateEnv',
  [Constants.ABILITY_TYPE_DAMAGE]: 'abilityDamage'
};
const COLUMN_WIDTH = 480;

/** Ability types that are shown: create unit/env, research, transform */
const SIMPLE_ABILITY_TYPES = [
  Constants.ABILITY_TYPE_CREATE_UNIT,
  Constants.ABILITY_TYPE_RESEARCH,
  Constants.ABILITY_TYPE_TRANSFORM,
  Constants.ABILITY_TYPE_CREATE_ENV
];

/** On-death abilities also include damage (e.g. explosion of a bomb) */
const DEATH_ABILITY_TYPES = [...SIMPLE_ABILITY_TYPES, Constants.ABILITY_TYPE_DAMAGE];

/**
 * Work abilities that create units/envs, research or transform the unit, and on-death abilities.
 * Other abilities (on action, zone events) are not shown yet
 */
export const getShownAbilities = (unit: Unit) => (unit.abilities ?? []).filter(container => {
  const abilityType = container.ability?.abilityType;
  if (abilityType == null) {
    return false;
  }
  return container.containerType === CONTAINER_TYPE_WORK
    ? SIMPLE_ABILITY_TYPES.includes(abilityType)
    : container.containerType === CONTAINER_TYPE_DEATH && DEATH_ABILITY_TYPES.includes(abilityType);
});

export const AbilitiesTab = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const abilities = getShownAbilities(unit);
  const workAbilities = abilities.filter(container => container.containerType === CONTAINER_TYPE_WORK);
  const deathAbilities = abilities.filter(container => container.containerType === CONTAINER_TYPE_DEATH);

  return (
    <>
      <h3>{t('abilitiesTabTitle')}</h3>
      <ResizableGrid minWidth={MIN_WIDTH} paddingTop={0}>
        <GridGroup heading={workAbilities[0]?.containerName} columnWidth={COLUMN_WIDTH}>
          {workAbilities.map((container, index) => <AbilityTable key={index} container={container} />)}
        </GridGroup>
        <GridGroup heading={deathAbilities[0]?.containerName} columnWidth={COLUMN_WIDTH}>
          {deathAbilities.map((container, index) => container.ability?.abilityType === Constants.ABILITY_TYPE_DAMAGE
            ? <DamageAbilityTable key={index} ability={container.ability} />
            : <AbilityTable key={index} container={container} />)}
        </GridGroup>
      </ResizableGrid>
    </>
  );
};

const abilityLabel = (ability: Ability, t: TFunction, disabled?: boolean) =>
  <HeaderChip
    id={ability.abilityId}
    tooltip={t('abilitiesTooltipID', { value: ability.abilityId })}
    label={t(ABILITY_NAMES[ability.abilityType])}
    disabled={disabled} />;

/** Damage to units and envs around, like a weapon */
const DamageAbilityTable = ({ ability }: { ability: Ability }) => {
  const { t } = useTranslation();
  const damage = ability.damage!;
  const rows = [
    { label: t('damageAreaCell'), value: <DamageAreaValue damage={damage} /> },
    { label: t('damageFriendlyCell'), value: t(String(!!damage.damageFriendly)) },
  ];

  return (
    <Frame labelShift='80px' label={abilityLabel(ability, t)}>
      <FrameSection sx={{ paddingTop: '14px' }}>
        <DamageTable damages={damage.damages} attacksNumber={damage.damagesCount} />
        <Stack sx={{ width: '100%', gap: '5px', padding: '5px', boxSizing: 'border-box' }}>
          <BuffButton buff={damage.buff} />
          <EnvButton damage={damage} />
        </Stack>
      </FrameSection>
      <FrameSection sx={{ overflow: 'auto', width: '100%' }}>
        <StatTable rows={rows} labelWidth='48%' minWidth={MIN_WIDTH} />
      </FrameSection>
    </Frame>
  );
};

const AbilityTable = ({ container }: { container: AbilityContainer }) => {
  const { t } = useTranslation();
  const ability = container.ability as Ability;
  const work = container.work;
  const seconds = (value?: number) => withUnits(value, t(Constants.SECONDS_END_MARKER));
  const entity = ability.entityInfo;

  const rows = [
    {
      label: t('abilitiesTargetCell'),
      value: entity && <EntityInfo
        primary={t(entity.entityName)}
        secondary={localizeNation(t, entity.entityNation?.name)}
        image={entity.entityImage}
        route={getAbilityRoute(ability.abilityType)}
        id={entity.entityId}
        overflow />
    },
    { label: t('workAbilityMakeTimeCell'), value: seconds(work?.makeTime) },
    { label: t('workAbilityReserveLimitCell'), value: work?.reserve?.reserveLimit },
    { label: t('workAbilityReserveTimeCell'), value: seconds(work?.reserve?.reserveTime) },
    { label: t('abilitiesCountCell'), value: ability.count },
    { label: t('abilitiesDurationCell'), value: seconds(ability.duration) },
    { label: t('abilitiesLifeTimeCell'), value: seconds(ability.lifeTime) },
  ];

  const disabled = work?.enabled === false;
  const stats = <StatTable rows={rows} labelWidth='33%' minWidth={MIN_WIDTH} />;
  const label = abilityLabel(ability, t, disabled);

  // ability without cost (e.g. on death) - single column
  if (!work?.cost.length) {
    return (
      <Frame column label={label} labelShift='80px' disabled={disabled}>
        <FrameSection sx={{ width: '100%', paddingTop: '14px' }}>
          {stats}
        </FrameSection>
        {ability.requirements && <FrameSection>
          <RequirementsButton requirements={ability.requirements} />
        </FrameSection>}
      </Frame>
    );
  }

  return (
    <Frame label={label} labelShift='80px' disabled={disabled}>
      <FrameSection sx={{ paddingTop: '14px' }}>
        <CostTable label={t('workAbilityCostLabel')} cost={work.cost} />
        <Stack sx={{ width: '100%', gap: '5px', padding: '5px', boxSizing: 'border-box' }}>
          <RequirementsButton requirements={ability.requirements} />
        </Stack>
      </FrameSection>
      <FrameSection sx={{ overflow: 'auto', width: '100%' }}>
        {stats}
      </FrameSection>
    </Frame>
  );
};
