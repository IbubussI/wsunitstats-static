import * as Constants from '@/utils/constants';
import { CONTAINER_TYPE_ON_ACTION, CONTAINER_TYPE_WORK, type Unit, type Weapon, type Work } from '@/types/game';

// Replicates game upgrade scripts (gameplay/upgrades/*.lua) to show unit stats with applied researches

type Params = Record<string, string>;
type UpgradeScript = (unit: Unit, params: Params) => void;

const DAMAGE_AREA_TYPE: Record<string, string> = {
  '0': 'damageAreaSingle',
  '1': 'damageAreaArea',
  '2': 'damageAreaFrontal'
};

function tonumber(value: string | undefined, defaultValue: number): number;
function tonumber(value: string | undefined, defaultValue: null): number | null;
function tonumber(value: string | undefined, defaultValue: number | null) {
  if (value == null) {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

function tobool(value: string | undefined, defaultValue: boolean) {
  const num = Number(value);
  if (value != null && !isNaN(num)) {
    return num !== 0;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return defaultValue;
}

function processTurretsAndWeapons(unit: Unit, turretId: number | null, weaponId: number | null, weaponConsumer: (weapon: Weapon) => void) {
  const processWeapons = (weapons: Weapon[] = []) => {
    if (weaponId === null) {
      weapons.forEach(weaponConsumer);
    } else {
      weaponConsumer(weapons[weaponId]);
    }
  };

  if (turretId === null) {
    processWeapons(unit.weapons);
  } else if (turretId < 0) {
    unit.turrets?.forEach(turret => processWeapons(turret.weapons));
  } else {
    processWeapons(unit.turrets?.[turretId].weapons);
  }
}

function collectWorks(unit: Unit) {
  const works: Record<number, Work> = {};
  for (const container of unit.abilities ?? []) {
    if (container.containerType === CONTAINER_TYPE_WORK && container.work) {
      works[container.work.workId] = container.work;
    }
  }
  return works;
}

function processWorks(unit: Unit, params: Params, workConsumer: (work: Work) => void) {
  const works = collectWorks(unit);
  const workIds = [tonumber(params.work, null), tonumber(params.work2, null), tonumber(params.work3, null)];
  if (workIds[0] === null) {
    Object.values(works).forEach(workConsumer);
  } else {
    // work2 is taken only if work is set, work3 - only if work2 is set
    for (const workId of workIds) {
      if (workId === null) {
        break;
      }
      workConsumer(works[workId]);
    }
  }
}

// -------------------------------- SCRIPTS --------------------------------

const moveSpeed: UpgradeScript = (unit, params) => {
  if (!unit.movement) {
    return;
  }
  // in engine move-speed UI value represented by internal num divided by 16
  const add = tonumber(params.add, 0) / 16;
  const mult = tonumber(params.mult, 100);
  const addR = tonumber(params.addRotation, 0);
  const multR = tonumber(params.multRotation, 100);
  const movement = unit.movement;
  movement.speed = (movement.speed ?? 0) * Math.floor(mult / 100) + add;
  movement.rotationSpeed = (movement.rotationSpeed ?? 0) * Math.floor(multR / 100) + addR;
};

const gatherSpeedAdd: UpgradeScript = (unit, params) => {
  const gather = unit.gather?.[tonumber(params.gather, 0)];
  if (gather) {
    const add = tonumber(params.add, 0);
    gather.perSecond = Number(((gather.perSecond ?? 0) + add / Constants.TICK_RATE).toFixed(1));
  }
};

const setDamageArea: UpgradeScript = (unit, params) => {
  const area = DAMAGE_AREA_TYPE[params.area] ?? 'N/A';
  processTurretsAndWeapons(unit, tonumber(params.turret, null), tonumber(params.weapon, null), (weapon) => {
    weapon.damage.areaType = area;
  });
};

const spreadMult: UpgradeScript = (unit, params) => {
  const mult = tonumber(params.mult, 100);
  processTurretsAndWeapons(unit, tonumber(params.turret, null), tonumber(params.weapon, null), (weapon) => {
    weapon.spread = Math.floor((weapon.spread ?? 0) * mult / 100);
  });
};

const armorAddSize: UpgradeScript = (unit, params) => {
  const armorList = unit.armorZonal;
  if (!armorList) {
    return;
  }
  const addVal = tonumber(params.add, 0);
  const add = (armorId: number) => {
    const armor = armorList[armorId];
    if (armorList.length === 2 && addVal === 100) {
      // strange case for stone units: n1/100%, n2/0%, armor=1,add=100 => n1/50%, n2/50%
      armorList[0].probability = 50;
      armor.probability = 50;
    } else {
      armor.probability = armor.probability + addVal;
    }
  };

  for (const armorId of [tonumber(params.armor, null), tonumber(params.armor2, null), tonumber(params.armor3, null)]) {
    if (armorId === null) {
      break;
    }
    add(armorId);
  }
};

const armorAddThickness: UpgradeScript = (unit, params) => {
  const armorList = unit.armorZonal ?? [];
  const mods = [
    { armor: tonumber(params.armor, 0), add: tonumber(params.add, 0), mult: tonumber(params.mult, 100) },
    { armor: tonumber(params.armor2, null), add: tonumber(params.add2, 0), mult: tonumber(params.mult2, 100) },
    { armor: tonumber(params.armor3, null), add: tonumber(params.add3, 0), mult: tonumber(params.mult3, 100) },
    { armor: tonumber(params.armor4, null), add: tonumber(params.add4, 0), mult: tonumber(params.mult4, 100) }
  ];
  for (let i = 0; i < Math.min(mods.length, armorList.length); i++) {
    const { armor: armorId, add, mult } = mods[i];
    if (armorId === null) {
      break;
    }
    const armor = armorList[armorId];
    armor.value = Math.floor(armor.value * mult / 100) + add / Constants.ENGINE_FLOAT_SHIFT;
  }
};

const rechargePeriodDec: UpgradeScript = (unit, params) => {
  const dec = tonumber(params.dec, 0);
  processTurretsAndWeapons(unit, tonumber(params.turret, null), tonumber(params.weapon, null), (weapon) => {
    weapon.rechargePeriod = Number((weapon.rechargePeriod - dec / Constants.ENGINE_FLOAT_SHIFT).toFixed(1));
  });
};

const maxDistanceAdd: UpgradeScript = (unit, params) => {
  const add = tonumber(params.add, 0) / Constants.ENGINE_FLOAT_SHIFT;
  processTurretsAndWeapons(unit, tonumber(params.turret, null), tonumber(params.weapon, null), (weapon) => {
    weapon.distance.max = (weapon.distance.max ?? 0) + add;
    weapon.distance.stop = (weapon.distance.stop ?? 0) + add;
  });
};

const workEnable: UpgradeScript = (unit, params) => {
  const work = collectWorks(unit)[tonumber(params.id, 0)];
  if (work) {
    work.enabled = tobool(params.enable, true);
  }
};

const regeneration: UpgradeScript = (unit, params) => {
  const add = tonumber(params.add, 0);
  unit.regenerationSpeed = (unit.regenerationSpeed ?? 0) + add / Constants.ENGINE_FLOAT_SHIFT;
};

const buildingSpeedMult: UpgradeScript = (unit, params) => {
  const mult = tonumber(params.mult, 100);
  const buildingId = tonumber(params.building, null);
  const constructions = buildingId === null ? unit.construction ?? [] : [unit.construction?.[buildingId]];
  for (const construction of constructions) {
    if (construction) {
      construction.constructionSpeed = Math.floor((construction.constructionSpeed ?? 0) * mult / 100);
    }
  }
};

const gatherBagSizeAdd: UpgradeScript = (unit, params) => {
  const add = tonumber(params.add, 0);
  const gatherId = tonumber(params.gather, null);
  const gathers = gatherId === null ? unit.gather ?? [] : [unit.gather?.[gatherId]];
  for (const gather of gathers) {
    if (gather) {
      gather.bagSize = (gather.bagSize ?? 0) + add / Constants.ENGINE_FLOAT_SHIFT;
    }
  }
};

const workReserveTimeMult: UpgradeScript = (unit, params) => {
  const mult = tonumber(params.mult, 100);
  processWorks(unit, params, (work) => {
    if (work?.reserve) {
      work.reserve.reserveTime = Math.floor((work.reserve.reserveTime ?? 0) * mult / 100);
    }
  });
};

const workReserveLimitAdd: UpgradeScript = (unit, params) => {
  const add = tonumber(params.add, 0);
  processWorks(unit, params, (work) => {
    if (work?.reserve) {
      work.reserve.reserveLimit = (work.reserve.reserveLimit ?? 0) + add;
    }
  });
};

const storageMultiplierAdd: UpgradeScript = (unit, params) => {
  const add = tonumber(params.add, 0);
  unit.storageMultiplier = (unit.storageMultiplier ?? 0) + Math.floor(Constants.ENGINE_STORAGE_MULTIPLIER * add);
};

const workPriceChange: UpgradeScript = (unit, params) => {
  const mult = tonumber(params.mult, 100);
  const add = tonumber(params.add, 0);
  const resourceId = tonumber(params.resource, null);
  const work = collectWorks(unit)[tonumber(params.work, 0)];
  if (!work) {
    return;
  }
  const resources = resourceId === null ? work.cost : [work.cost[resourceId]];
  for (const resource of resources) {
    resource.value = Math.floor(resource.value * mult / 100) + add / Constants.ENGINE_FLOAT_SHIFT;
  }
};

const enable: UpgradeScript = (unit, params) => {
  const weaponId = tonumber(params.weapon, 0);
  const turretId = tonumber(params.turret, null);
  const weapons = turretId === null ? unit.weapons : unit.turrets?.[turretId].weapons;
  const weapon = weapons?.[weaponId];
  if (weapon) {
    weapon.enabled = tobool(params.enable, true);
  }
};

const abilityOnActionEnable: UpgradeScript = (unit, params) => {
  const enabled = tobool(params.enable, true);
  for (const container of unit.abilities ?? []) {
    if (container.containerType === CONTAINER_TYPE_ON_ACTION) {
      container.enabled = enabled;
    }
  }
};

const damageAdd: UpgradeScript = (unit, params) => {
  const add = tonumber(params.add, 0);
  const mult = tonumber(params.mult, 100);
  processTurretsAndWeapons(unit, tonumber(params.turret, null), tonumber(params.weapon, null), (weapon) => {
    const damage = weapon.damage.damages?.[0];
    if (damage) {
      damage.value = Math.floor(damage.value * mult / 100) + add / Constants.ENGINE_FLOAT_SHIFT;
    }
  });
};

/** Upgrade scripts by program id (index of the script in gameplay.json upgradesScripts) */
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
  32: enable, // unit/weapon/enable.lua
  33: abilityOnActionEnable, // unit/abilityOnActionEnable.lua
  34: damageAdd, // unit/weapon/damageAdd.lua
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
        console.error(`Can't apply research script ${upgrade.programId}`, error);
      }
    }
  }
  return unitCopy;
};
