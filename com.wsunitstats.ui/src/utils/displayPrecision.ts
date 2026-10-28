import { roundHalfUp } from '@/utils/utils';
import type { Unit, Weapon, ZonalArmor } from '@/types/game';

// Some unit values are exported precisely, as research scripts need game values. Researches also produce values
// more precise than the game shows. Both are shown with the precision the game shows them.

/** Whole numbers, as the game shows them (integer division) */
const whole = (value: number | undefined) =>
  value == null ? value : Math.floor(value + 1e-9);

/** One decimal, truncated as the game shows them (e.g. recharge 2.08 is 2.0) */
const decimal = (value: number | undefined) =>
  value == null ? value : Math.trunc(value * 10 + Math.sign(value) * 1e-9) / 10;

/** One decimal for values the game does not show (calculated by the site) */
const calculatedDecimal = (value: number | undefined) => roundHalfUp(value, 1);

/**
 * The game uses probabilities of the armor zones as weights (they do not always sum up to 100, also after researches)
 * and shows each zone as its share of the sum in whole percents
 */
const armorZonesToDisplay = (armorList: ZonalArmor[]): ZonalArmor[] => {
  const sum = armorList.reduce((acc, armor) => acc + Math.max(armor.probability, 0), 0);
  return armorList.map(armor => ({
    value: decimal(armor.value)!,
    probability: sum > 0 ? whole(Math.max(armor.probability, 0) / sum * 100)! : whole(armor.probability)!
  }));
};

const weaponToDisplay = (weapon: Weapon): Weapon => ({
  ...weapon,
  spread: whole(weapon.spread),
  rechargePeriod: decimal(weapon.rechargePeriod)!,
  distance: {
    min: decimal(weapon.distance.min),
    max: decimal(weapon.distance.max),
    stop: decimal(weapon.distance.stop)
  },
  damage: {
    ...weapon.damage,
    damages: weapon.damage.damages?.map(damage => ({ ...damage, value: whole(damage.value)! }))
  }
});

/** Returns a copy of the unit with values rounded to the precision they are shown with */
export const toDisplayPrecision = (unit: Unit): Unit => ({
  ...unit,
  viewRange: whole(unit.viewRange),
  regenerationSpeed: decimal(unit.regenerationSpeed),
  storageMultiplier: whole(unit.storageMultiplier),
  movement: unit.movement && {
    ...unit.movement,
    speed: whole(unit.movement.speed),
    speedReverse: whole(unit.movement.speedReverse),
    rotationSpeed: decimal(unit.movement.rotationSpeed)
  },
  armorZonal: unit.armorZonal && armorZonesToDisplay(unit.armorZonal),
  weapons: unit.weapons?.map(weaponToDisplay),
  turrets: unit.turrets?.map(turret => ({ ...turret, weapons: turret.weapons.map(weaponToDisplay) })),
  gather: unit.gather?.map(gather => ({
    ...gather,
    perSecond: decimal(gather.perSecond),
    bagSize: whole(gather.bagSize)
  })),
  construction: unit.construction?.map(construction => ({
    ...construction,
    constructionSpeed: calculatedDecimal(construction.constructionSpeed)
  })),
  abilities: unit.abilities?.map(container => container.work ? {
    ...container,
    work: {
      ...container.work,
      cost: container.work.cost.map(resource => ({ ...resource, value: whole(resource.value)! })),
      reserve: container.work.reserve && {
        reserveLimit: whole(container.work.reserve.reserveLimit),
        reserveTime: whole(container.work.reserve.reserveTime)
      }
    }
  } : container)
});
