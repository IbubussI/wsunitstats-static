import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { roundHalfUp } from '@/utils/utils';
import { CONTAINER_TYPE_ICON, type IconAbility, type Tag, type Unit } from '@/types/game';
import { GLYPHS, type GlyphKind } from './abilityGlyphs';

/** Abilities of the unit shown as icons */
export const getIconAbilities = (unit: Unit) => (unit.abilities ?? [])
  .filter(container => container.containerType === CONTAINER_TYPE_ICON)
  .flatMap(container => container.abilities ?? []);

/** Distance in steps, with the plural form of the language */
const steps = (t: TFunction, value?: number) => t('abilityIconSteps', { count: value ?? 0 });

const tagNames = (t: TFunction, tags?: Tag[]) =>
  tags?.length ? tags.map(tag => t(tag.name)).join(', ') : t('abilityIconAllUnits');

/** Unit tag "Large Land Collider": tanks don't damage units with it and don't move them aside */
const LARGE_UNITS_TAG = 32;

/** Suffix of the line about the affected units naming the excluded ones, e.g. ", except large units" */
const except = (t: TFunction, excluded?: Tag[]) => {
  if (!excluded?.length) {
    return '';
  }
  return excluded.length === 1 && excluded[0].gameId === LARGE_UNITS_TAG
    ? t('abilityIconExceptLargeUnits')
    : t('abilityIconExcept', { tags: tagNames(t, excluded) });
};

const targets = (t: TFunction, ability: IconAbility) => {
  const side = ability.affectsAllies === false ? 'abilityIconEnemies'
    : ability.affectsEnemies === false ? 'abilityIconAllies'
      : 'abilityIconAlliesAndEnemies';
  return t('abilityIconTargets', { side: t(side), tags: tagNames(t, ability.affectedUnits) }) + except(t, ability.excludedUnits);
};

/** Title and lines of the tooltip describing what the ability does in the game */
const describe = (t: TFunction, ability: IconAbility): { title: string; lines: (string | false | undefined)[] } => {
  const research = ability.research && t(ability.research.entityName);
  const description = ability.researchDescription && t(ability.researchDescription);
  const duration = ability.duration != null && t('abilityIconDuration', { value: ability.duration });
  const recharge = ability.rechargeTime != null && ability.trigger === 'action'
    && t('abilityIconRecharge', { value: ability.rechargeTime });

  switch (ability.icon) {
    case 'crushUnits':
      return {
        title: t('abilityIconCrushUnits'),
        lines: [
          ...(ability.damages ?? []).map(damage => t('abilityIconDamage', { value: damage.value, targets: t(damage.type) })
            + except(t, ability.damageExcludedUnits)),
          ability.moveDistance != null
            && t('abilityIconMoveAside', { radius: ability.radius, distance: steps(t, ability.moveDistance) }) + except(t, ability.excludedUnits)
        ]
      };
    case 'crushEnvs':
      return {
        title: t('abilityIconCrushEnvs'),
        lines: [
          t('abilityIconDamage', { value: ability.envDamage, targets: tagNames(t, ability.affectedEnvs) }),
          research && t('abilityIconGetsBuff', { research, duration: ability.duration }),
          description
        ]
      };
    case 'selfBuff':
      return {
        title: research ?? t('abilityIconSelfBuff'),
        lines: [
          description,
          duration,
          recharge,
          ability.distance?.max != null && t('abilityIconDistance', { min: ability.distance.min ?? 0, max: steps(t, ability.distance.max) })
        ]
      };
    case 'areaBuff':
      return {
        title: t('abilityIconAreaBuff', { research }),
        lines: [
          description,
          targets(t, ability),
          t('abilityIconRadius', { value: ability.radius }),
          duration,
          ability.moveDistance != null && t('abilityIconMoveAway', { distance: steps(t, ability.moveDistance) })
        ]
      };
    case 'scatter':
      return {
        title: ability.createdUnit
          ? t('abilityIconPlants', { unit: t(ability.createdUnit.entityName) })
          : t('abilityIconScatter'),
        lines: [t('abilityIconScatterUnits', { radius: ability.radius, distance: steps(t, ability.moveDistance) }) + except(t, ability.excludedUnits)]
      };
    case 'dance':
      return {
        title: t('abilityIconDance'),
        lines: [t('abilityIconDanceStun', { value: ability.duration })]
      };
    case 'autoTransform':
      // only gates do it: a closed gate opens when the units come, an open one closes when they leave
      return {
        title: t(ability.unitsAbsent ? 'abilityIconAutoClose' : 'abilityIconAutoOpen', { radius: ability.radius }),
        lines: []
      };
  }
};

/** Icon with its tooltip: an ability or a movement trait of the unit */
interface IconEntry {
  glyph: GlyphKind;
  title: string;
  lines: (string | false | undefined)[];
  /** enabled by a research */
  disabled?: boolean;
}

/** Seconds to get from zero to the given speed, e.g. 0.5 */
const secondsToReach = (speed: number, acceleration: number) => roundHalfUp(speed / acceleration, 2);

/** Movement traits shown as icons: gradual acceleration, turning along an arc, moving backwards */
const getMovementEntries = (t: TFunction, unit: Unit): IconEntry[] => {
  const movement = unit.movement;
  if (!movement) {
    return [];
  }
  const entries: IconEntry[] = [];
  if (movement.acceleration || movement.rotationAcceleration) {
    entries.push({
      glyph: 'accelerate',
      title: t('movementIconAccelerate'),
      lines: [
        !!movement.acceleration && movement.speed != null
          && t('movementIconFullSpeed', { value: secondsToReach(movement.speed, movement.acceleration) }),
        !!movement.rotationAcceleration && movement.rotationSpeed != null
          && t('movementIconFullRotation', { value: secondsToReach(movement.rotationSpeed, movement.rotationAcceleration) })
      ]
    });
  }
  if (movement.smoothTurn) {
    entries.push({ glyph: 'uTurn', title: t('movementIconUTurn'), lines: [t('movementIconUTurnDetails')] });
  }
  if (movement.speedReverse) {
    entries.push({
      glyph: 'reverse',
      title: t('movementIconReverse'),
      lines: [t('movementIconReverseSpeed', { value: movement.speedReverse })]
    });
  }
  return entries;
};

const IconTooltip = ({ entry }: { entry: IconEntry }) => {
  const { t } = useTranslation();
  return (
    <Stack sx={{ gap: '2px', padding: '2px' }}>
      <Typography variant='body2' sx={{ fontWeight: 'bold' }}>{entry.title}</Typography>
      {entry.lines.filter(line => !!line).map((line, index) =>
        <Typography key={index} variant='caption' sx={{ lineHeight: 1.3 }}>{line}</Typography>)}
      {entry.disabled &&
        <Typography variant='caption' sx={{ lineHeight: 1.3, fontStyle: 'italic' }}>{t('abilityIconNeedsResearch')}</Typography>}
    </Stack>
  );
};

/** Row of ability and movement icons with tooltips describing them, shown under the unit image */
export const AbilityIcons = ({ unit }: { unit: Unit }) => {
  const { t } = useTranslation();
  const entries: IconEntry[] = [
    ...getIconAbilities(unit).map(ability => ({
      glyph: ability.icon,
      ...describe(t, ability),
      disabled: ability.enabled === false
    })),
    ...getMovementEntries(t, unit)
  ];
  if (!entries.length) {
    return null;
  }
  return (
    <Stack direction='row' sx={{ gap: '5px', paddingTop: '6px', maxWidth: '150px', flexWrap: 'wrap', justifyContent: 'center' }}>
      {entries.map((entry, index) => {
        const Glyph = GLYPHS[entry.glyph];
        return (
          <Tooltip key={index} title={<IconTooltip entry={entry} />} arrow>
            <Box sx={{
              display: 'flex',
              width: '32px',
              height: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '6px',
              backgroundColor: 'action.hover',
              color: 'text.primary',
              opacity: entry.disabled ? 0.45 : 1,
              cursor: 'help'
            }}>
              <Glyph sx={{ fontSize: '24px' }} />
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
};
