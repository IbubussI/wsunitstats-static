import {
  CONTAINER_TYPE_ICON,
  CONTAINER_TYPE_WORK,
  type Resource,
  type Unit,
  type Weapon,
  type Work
} from '@/types/game';

// Replicates the game upgrade scripts (Projects/WarSelection/scripts/gameplay/upgrades/*.lua) to show unit stats
// with applied researches. The scripts work with game values, so each exported value is converted back to the game
// value (the exporter keeps enough precision for that), changed the same way as the script does and converted back.

type Params = Record<string, string>;
type UpgradeScript = (unit: Unit, params: Params) => void;

// exported value = game value / scale (see the exporter transformations)
const SHIFT = 1000; // distances, times, damage, armor thickness, bag size, view range, resources
const SPEED_SCALE = 16; // movement speed
const TICK_SCALE = 50; // per tick values shown per second: gather speed, regeneration
const SPREAD_SCALE = 10; // weapon spread, %
const ANGLE_SCALE = 4096 * 1000; // rotation speed
const STORAGE_SCALE = 65536 / 100; // storage multiplier, %
const BUILD_SPEED_SCALE = SHIFT / 0.238095; // construction speed, %/sec (see the exporter BUILD_SPEED_MODIFIER)

const toGame = (value: number, scale: number) => Math.round(value * scale);
const fromGame = (value: number, scale: number) => value / scale;
/** Applies a change to the exported value in game units */
const change = (value: number, scale: number, changer: (gameValue: number) => number) =>
  fromGame(changer(toGame(value, scale)), scale);
/** Lua "value * mult // 100" */
const multiply = (value: number, mult: number) => Math.floor(value * mult / 100);

/** Lua tonumber(getParameter(name)) */
const tonumber = (value: string | undefined) => {
  if (value == null) {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

/** CommonScripts/functions/typesConversation.lua toBool for a string parameter */
const tobool = (value: string | undefined, defaultValue: boolean) => {
  if (value == null) {
    return defaultValue;
  }
  if (value === 'true') {
    return true;
  }
  const num = tonumber(value);
  return num != null && num !== 0;
};

const required = <T>(value: T | undefined | null, message: string): T => {
  if (value == null) {
    throw new Error(message);
  }
  return value;
};

/**
 * Weapons selected by "turret" and "weapon" parameters: no turret - unit weapons, turret < 0 - weapons of all turrets;
 * no weapon - all weapons
 */
function forEachWeapon(unit: Unit, params: Params, consumer: (weapon: Weapon) => void) {
  const weaponId = tonumber(params.weapon);
  const turretId = tonumber(params.turret);
  const processWeapons = (weapons: Weapon[] = []) => {
    if (weaponId == null) {
      weapons.forEach(consumer);
    } else {
      consumer(required(weapons.find(weapon => weapon.weaponId === weaponId), `No weapon ${weaponId}`));
    }
  };

  if (turretId == null) {
    processWeapons(unit.weapons);
  } else if (turretId < 0) {
    unit.turrets?.forEach(turret => processWeapons(turret.weapons));
  } else {
    processWeapons(required(unit.turrets?.find(turret => turret.turretId === turretId), `No turret ${turretId}`).weapons);
  }
}

function getWorks(unit: Unit) {
  return (unit.abilities ?? [])
    .filter(container => container.containerType === CONTAINER_TYPE_WORK && container.work)
    .map(container => container.work as Work);
}

function getWork(unit: Unit, workId: number | undefined) {
  return required(getWorks(unit).find(work => work.workId === workId), `No work ${workId}`);
}

/** "work" parameter, then "work2" if "work" is set, then "work3" if "work2" is set; no "work" - all works */
function forEachWork(unit: Unit, params: Params, consumer: (work: Work) => void) {
  if (params.work == null) {
    getWorks(unit).forEach(consumer);
    return;
  }
  consumer(getWork(unit, tonumber(params.work)));
  if (params.work2 != null) {
    consumer(getWork(unit, tonumber(params.work2)));
    if (params.work3 != null) {
      consumer(getWork(unit, tonumber(params.work3)));
    }
  }
}

// -------------------------------- SCRIPTS --------------------------------

// unit/moveSpeed.lua
const moveSpeed: UpgradeScript = (unit, params) => {
  const movement = unit.movement;
  if (!movement) {
    return;
  }
  const add = tonumber(params.add) ?? 0;
  const mult = tonumber(params.mult) ?? 100;
  const addR = tonumber(params.addRotation) ?? 0;
  const multR = tonumber(params.multRotation) ?? 100;

  const changeSpeed = (speed: number) => change(speed, SPEED_SCALE, (value) => multiply(value, mult) + add);
  movement.speed = changeSpeed(movement.speed ?? 0);
  // reverse speed is changed only for units that can move backwards
  if (movement.speedReverse) {
    movement.speedReverse = changeSpeed(movement.speedReverse);
  }
  movement.rotationSpeed = change(movement.rotationSpeed ?? 0, ANGLE_SCALE, (value) => multiply(value, multR) + addR);
  // agro speed is changed as well, but it is not exported
};

// unit/gather/speedAdd.lua
const gatherSpeedAdd: UpgradeScript = (unit, params) => {
  const gatherId = tonumber(params.gather);
  const gather = required(unit.gather?.find(gather => gather.gatherId === gatherId), `No gather ${gatherId}`);
  const add = required(tonumber(params.add), 'No add parameter');
  gather.perSecond = change(gather.perSecond ?? 0, TICK_SCALE, (value) => value + add);
};

// unit/gather/bagSizeAdd.lua
const gatherBagSizeAdd: UpgradeScript = (unit, params) => {
  const add = required(tonumber(params.add), 'No add parameter');
  const gatherId = tonumber(params.gather);
  const gathers = params.gather == null
    ? unit.gather ?? []
    : [required(unit.gather?.find(gather => gather.gatherId === gatherId), `No gather ${gatherId}`)];
  for (const gather of gathers) {
    gather.bagSize = change(gather.bagSize ?? 0, SHIFT, (value) => value + add);
  }
};

const DAMAGE_AREA_TYPES: Record<string, string> = {
  '0': 'damageAreaSingle',
  '1': 'damageAreaArea',
  '2': 'damageAreaFrontal'
};

// unit/weapon/setDamageArea.lua
const setDamageArea: UpgradeScript = (unit, params) => {
  const area = required(params.area, 'No area parameter');
  // the same names as the exporter gives
  forEachWeapon(unit, params, (weapon) => {
    weapon.damage.areaType = DAMAGE_AREA_TYPES[area] ?? 'N/A';
  });
};

// unit/weapon/spreadMult.lua
const spreadMult: UpgradeScript = (unit, params) => {
  const mult = required(tonumber(params.mult), 'No mult parameter');
  // the program is also applied by auras and buffs, so a unit without attack is a usual case
  if (!unit.weapons && !unit.turrets) {
    return;
  }
  forEachWeapon(unit, params, (weapon) => {
    // no spread (melee weapon) is zero spread in the game, it stays zero
    if (weapon.spread != null) {
      weapon.spread = change(weapon.spread, SPREAD_SCALE, (value) => multiply(value, mult));
    }
  });
};

// unit/armor/addSize.lua; probabilities of the armor zones are weights (see toDisplayPrecision)
const armorAddSize: UpgradeScript = (unit, params) => {
  const armorList = unit.armorZonal ?? [];
  const add = required(tonumber(params.add), 'No add parameter');
  const addTo = (armorId: number | undefined) => {
    const armor = required(armorList[armorId ?? -1], `No armor ${armorId}`);
    armor.probability = armor.probability + add;
  };

  addTo(tonumber(params.armor));
  if (params.armor2 != null) {
    addTo(tonumber(params.armor2));
    if (params.armor3 != null) {
      addTo(tonumber(params.armor3));
    }
  }
};

// unit/armor/addThickness.lua
const armorAddThickness: UpgradeScript = (unit, params) => {
  const armorList = unit.armorZonal ?? [];
  const size = armorList.length;
  const mod = (armorId: string, add: string, mult: string) => {
    const armor = required(armorList[tonumber(armorId) ?? -1], `No armor ${armorId}`);
    armor.value = change(armor.value, SHIFT, (value) => multiply(value, tonumber(mult) ?? 100) + (tonumber(add) ?? 0));
  };

  if (size > 0) {
    mod(params.armor, params.add, params.mult);
    if (size > 1 && params.armor2 != null) {
      mod(params.armor2, params.add2, params.mult2);
      if (size > 2 && params.armor3 != null) {
        mod(params.armor3, params.add3, params.mult3);
        if (size > 3 && params.armor4 != null) {
          mod(params.armor4, params.add4, params.mult4);
        }
      }
    }
  }
};

// unit/weapon/rechargePeriodDec.lua
const rechargePeriodDec: UpgradeScript = (unit, params) => {
  const dec = tonumber(params.dec) ?? 0;
  const mult = tonumber(params.mult) ?? 100;
  forEachWeapon(unit, params, (weapon) => {
    weapon.rechargePeriod = change(weapon.rechargePeriod, SHIFT, (value) => multiply(value, mult) - dec);
  });
};

// unit/weapon/maxDistanceAdd.lua
const maxDistanceAdd: UpgradeScript = (unit, params) => {
  const add = required(tonumber(params.add), 'No add parameter');
  forEachWeapon(unit, params, (weapon) => {
    weapon.distance.max = change(weapon.distance.max ?? 0, SHIFT, (value) => value + add);
    weapon.distance.stop = change(weapon.distance.stop ?? 0, SHIFT, (value) => value + add);
  });
};

// unit/work/enable.lua
const workEnable: UpgradeScript = (unit, params) => {
  const id = required(tonumber(params.id), 'No id parameter');
  getWork(unit, id).enabled = tobool(params.enable, true);
};

// unit/regeneration.lua
const regeneration: UpgradeScript = (unit, params) => {
  const set = tonumber(params.set);
  unit.regenerationSpeed = set != null
    ? fromGame(set, TICK_SCALE)
    : change(unit.regenerationSpeed ?? 0, TICK_SCALE, (value) => value + (tonumber(params.add) ?? 0));
};

// unit/buildingSpeedMult.lua
const buildingSpeedMult: UpgradeScript = (unit, params) => {
  const mult = required(tonumber(params.mult), 'No mult parameter');
  const buildingId = tonumber(params.building);
  const constructions = params.building == null
    ? unit.construction ?? []
    : [required(unit.construction?.find(construction => construction.constructionId === buildingId), `No building ${buildingId}`)];
  for (const construction of constructions) {
    construction.constructionSpeed = change(construction.constructionSpeed ?? 0, BUILD_SPEED_SCALE, (value) => multiply(value, mult));
  }
};

// unit/work/reserveTimeMult.lua; works without reserve have zero reserve time in the game, it stays zero
const workReserveTimeMult: UpgradeScript = (unit, params) => {
  const mult = required(tonumber(params.mult), 'No mult parameter');
  forEachWork(unit, params, (work) => {
    if (work.reserve) {
      work.reserve.reserveTime = change(work.reserve.reserveTime ?? 0, SHIFT, (value) => multiply(value, mult));
    }
  });
};

// unit/work/reserveLimitAdd.lua
const workReserveLimitAdd: UpgradeScript = (unit, params) => {
  const add = required(tonumber(params.add), 'No add parameter');
  forEachWork(unit, params, (work) => {
    // a work without reserve has zero reserve limit and time in the game
    work.reserve ??= { reserveLimit: 0, reserveTime: 0 };
    work.reserve.reserveLimit = (work.reserve.reserveLimit ?? 0) + add;
  });
};

// unit/storageMultiplierAdd.lua
const storageMultiplierAdd: UpgradeScript = (unit, params) => {
  const add = required(tonumber(params.add), 'No add parameter');
  // the exporter truncates the percent
  unit.storageMultiplier = Math.trunc(fromGame(toGame(unit.storageMultiplier ?? 0, STORAGE_SCALE) + add, STORAGE_SCALE));
};

// unit/work/priceChange.lua
const workPriceChange: UpgradeScript = (unit, params) => {
  const mult = tonumber(params.mult) ?? 100;
  const add = tonumber(params.add) ?? 0;
  const resourceId = tonumber(params.resource);
  const work = getWork(unit, tonumber(params.work));

  const processResource = (resource: Resource) => {
    // the exporter truncates resources to whole numbers
    resource.value = Math.trunc(change(resource.value, SHIFT, (value) => multiply(value, mult) + add));
  };
  for (const resource of work.cost) {
    if (resourceId == null || resource.resourceId === resourceId) {
      processResource(resource);
    }
  }
};

// unit/weapon/enable.lua; the script assigns the "enable" parameter as is (no researches set it for now),
// here it is read like other enable parameters
const weaponEnable: UpgradeScript = (unit, params) => {
  const weaponId = required(tonumber(params.weapon), 'No weapon parameter');
  const turretId = tonumber(params.turret);
  const weapons = turretId == null
    ? unit.weapons
    : required(unit.turrets?.find(turret => turret.turretId === turretId), `No turret ${turretId}`).weapons;
  const weapon = required(weapons?.find(weapon => weapon.weaponId === weaponId), `No weapon ${weaponId}`);
  weapon.enabled = tobool(params.enable, true);
};

// unit/abilityOnActionEnable.lua
const abilityOnActionEnable: UpgradeScript = (unit, params) => {
  const enabled = params.enable !== 'false';
  // on action abilities are shown as icons
  for (const container of unit.abilities ?? []) {
    if (container.containerType === CONTAINER_TYPE_ICON) {
      container.abilities?.filter(ability => ability.trigger === 'action').forEach(ability => ability.enabled = enabled);
    }
  }
};

// unit/weapon/damageAdd.lua
const damageAdd: UpgradeScript = (unit, params) => {
  const add = tonumber(params.add) ?? 0;
  const mult = tonumber(params.mult) ?? 100;
  const raise = (value: number) => change(value, SHIFT, (gameValue) => multiply(gameValue, mult) + add);
  forEachWeapon(unit, params, (weapon) => {
    const damages = weapon.damage.damages ?? [];
    const base = damages.find(damage => damage.type === 'damageTypeBase');
    if (base) {
      // only the default damage is raised, values by target tag stay as they are
      base.value = raise(base.value);
      return;
    }
    // a weapon without the default damage: positive values by target tag are raised, zero values (exclusions) are kept
    for (const damage of damages) {
      if (damage.value > 0) {
        damage.value = raise(damage.value);
      }
    }
  });
};

// unit/viewRange.lua
const viewRange: UpgradeScript = (unit, params) => {
  const add = tonumber(params.add) ?? 0;
  const mult = tonumber(params.mult) ?? 100;
  unit.viewRange = change(unit.viewRange ?? 0, SHIFT, (value) => multiply(value, mult) + add);
};

// unit/controllable.lua
const controllable: UpgradeScript = (unit, params) => {
  unit.controllable = params.enable !== 'false';
};

/**
 * Upgrade scripts by program id (index of the script in gameplay.json upgradesScripts).
 * Other programs change player data (ages, territory, supply), not units
 */
const UPGRADE_SCRIPTS: Record<number, UpgradeScript> = {
  0: moveSpeed, // unit/moveSpeed.lua
  2: gatherSpeedAdd, // unit/gather/speedAdd.lua
  3: setDamageArea, // unit/weapon/setDamageArea.lua
  4: spreadMult, // unit/weapon/spreadMult.lua
  5: armorAddSize, // unit/armor/addSize.lua
  13: armorAddThickness, // unit/armor/addThickness.lua
  14: rechargePeriodDec, // unit/weapon/rechargePeriodDec.lua
  15: maxDistanceAdd, // unit/weapon/maxDistanceAdd.lua
  17: workEnable, // unit/work/enable.lua
  19: regeneration, // unit/regeneration.lua
  20: buildingSpeedMult, // unit/buildingSpeedMult.lua
  21: gatherBagSizeAdd, // unit/gather/bagSizeAdd.lua
  22: workReserveTimeMult, // unit/work/reserveTimeMult.lua
  23: workReserveLimitAdd, // unit/work/reserveLimitAdd.lua
  27: storageMultiplierAdd, // unit/storageMultiplierAdd.lua
  31: workPriceChange, // unit/work/priceChange.lua
  32: weaponEnable, // unit/weapon/enable.lua
  33: abilityOnActionEnable, // unit/abilityOnActionEnable.lua
  34: damageAdd, // unit/weapon/damageAdd.lua
  35: viewRange, // unit/viewRange.lua
  43: controllable, // unit/controllable.lua
};

/** Returns a copy of the unit with applied upgrades of the given researches */
export const applyResearches = (unit: Unit, researchIds: number[]): Unit => {
  if (!unit.applicableResearches || researchIds.length === 0) {
    return unit;
  }

  // copy the unit to not modify loaded original one
  const unitCopy: Unit = structuredClone(unit);
  for (const researchId of researchIds) {
    const research = unitCopy.applicableResearches?.find(research => research.gameId === researchId);
    for (const upgrade of research?.upgrades ?? []) {
      const applyScript = UPGRADE_SCRIPTS[upgrade.programId];
      if (!applyScript) {
        continue;
      }
      try {
        applyScript(unitCopy, upgrade.parameters ?? {});
      } catch (error) {
        console.error(`Can't apply research ${researchId} script ${upgrade.programId}`, error);
      }
    }
  }
  return unitCopy;
};
