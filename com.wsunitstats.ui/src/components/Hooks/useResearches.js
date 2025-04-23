import { useSearchParams } from 'react-router-dom';
import * as Constants from 'utils/constants';

const UPGRADE_SCRIPTS = {
  "0": moveSpeed, // 1749535993
  "2": gatherSpeedAdd, // 996158931
  "3": setDamageArea, // 2545488229
  "4": spreadMult, // 1165500952
  "5": armorAddSize, // 732754697
  "13": armorAddThickness, // 3347185990
  "14": rechargePeriodDec, // 3672228551
  "15": maxDistanceAdd, // 310275754
  "17": workEnable, // 1995273458
  "19": regeneration, // 1287263617
  "20": buildingSpeedMult, // 1184009123
  "21": gatherBagSizeAdd, // 4100800216
  "22": workReserveTimeMult, // 943779194
  "23": workReserveLimitAdd, // 4203811904
  "27": storageMultiplierAdd, // 2433490476
  "31": workPriceChange, // 1042819526
  "32": enable, // 1815469020
  "33": abilityOnActionEnable, // 1911934956
  "34": damageAdd, // 440889882
};

const DAMAGE_AREA_TYPE = {
  "0": "Single target",
  "1": "Area",
  "2": "In frontal area"
};

/**
 * Returns a function [(unit, researchId) => void] that applies research to the unit
 */
export function useResearches() {
  const [searchParams] = useSearchParams();
  const researchesParam = searchParams.get(Constants.PARAM_RESEARCH_IDS);

  return (unit) => {
    if (!unit.applicableResearches) {
      return unit;
    }

    // deep copy the unit to not modify loaded and cached original one
    const unitCopy = JSON.parse(JSON.stringify(unit));
    if (researchesParam) {
      const researchesIds = researchesParam.split(',');
      for (let researchId of researchesIds) {
        const research = unitCopy.applicableResearches.filter(v => v.gameId === Number(researchId))[0];
        if (research) {
          for (let upgrade of research.upgrades) {
            const applyScript = UPGRADE_SCRIPTS[upgrade.programId];
            try {
              const parameters = upgrade.parameters ? upgrade.parameters : {};
              applyScript(unitCopy, parameters);
            } catch (error) {
              console.log(`Can't apply research script ${applyScript.name}`);
              console.error(error);
            }
          }
        }
      }
    }
    return unitCopy;
  }
}

function tonumber(value, defaultValue) {
  let num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

function tobool(value, defaultValue) {
  const num = Number(value);
  if (!isNaN(num)) {
    return num !== 0;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return defaultValue;
}

function processTurretsAndWeapons(unit, turretId, weaponId, weaponConsumer) {
  function processWeapons(weapons) {
    if (weaponId === null) {
      for (const weapon of weapons) {
        weaponConsumer(weapon);
      }
    } else {
      weaponConsumer(weapons[weaponId]);
    }
  }

  if (turretId === null) {
    processWeapons(unit.weapons);
  } else if (turretId < 0) {
    for (const turret of unit.turrets) {
      processWeapons(turret.weapons);
    }
  } else {
    processWeapons(unit.turrets[turretId].weapons);
  }
}

function collectWorks(unit) {
  const works = {};
  for (const ability of unit.abilities) {
    // 1 - work ability
    if (ability.containerType === 1) {
      const work = ability.work;
      works[work.workId] = work;
    }
  }
  return works;
}

// -------------------------------- SCRIPTS --------------------------------

function moveSpeed(unit, params) {
  const add = tonumber(params.add, 0);
  const mult = tonumber(params.mult, 100);
  const addR = tonumber(params.addRotation, 0);
  const multR = tonumber(params.multRotation, 100);
  unit.movement.speed = unit.movement.speed * Math.floor(mult / 100) + add;
  unit.movement.rotationSpeed = unit.movement.rotationSpeed * Math.floor(multR / 100) + addR;

  //if (unit.notAgro) {
  //  unit.movement.moveAgroSpeed = unit.movement.moveAgroSpeed * Math.floor(mult / 100) + add;
  //}
}

function gatherSpeedAdd(unit, params) {
  const gatherId = tonumber(params.gather, null);
  const add = tonumber(params.add, 0);
  unit.gather[gatherId].perSecond = Number(unit.gather[gatherId].perSecond + add / Constants.TICK_RATE).toFixed(1);
}

function setDamageArea(unit, params) {
  const weaponId = tonumber(params.weapon, null);
  const turretId = tonumber(params.turret, null);
  const area = params.area;

  function processWeapon(weapon) {
    if (DAMAGE_AREA_TYPE[area]) {
      weapon.damage.areaType = DAMAGE_AREA_TYPE[area];
    } else {
      weapon.damage.areaType = "N/A";
    }
  }

  processTurretsAndWeapons(unit, turretId, weaponId, processWeapon);
}

function spreadMult(unit, params) {
  const weaponId = tonumber(params.weapon, null);
  const turretId = tonumber(params.turret, null);
  const mult = tonumber(params.mult, 100);

  function processWeapon(weapon) {
    weapon.spread = Math.floor(weapon.spread * mult / 100);
  }

  processTurretsAndWeapons(unit, turretId, weaponId, processWeapon);
}

function armorAddSize(unit, params) {
  const addVal = tonumber(params.add, 0);
  const armor = tonumber(params.armor, null);
  const armor2 = tonumber(params.armor2, null);
  const armor3 = tonumber(params.armor3, null);

  function add(armorId) {
    const a = unit.armor[armorId];
    if (unit.armor.length === 2 && addVal === 100) {
      // strange case for stone units: n1/100%, n2/0%, armor=1,add=100 => n1/50%, n2/50%
      unit.armor[0].probability = 50;
      a.probability = 50;
    } else {
      a.probability = a.probability + addVal;
    }
  }

  if (armor !== null) {
    add(armor);
    if (armor2 !== null) {
      add(armor2);
      if (armor3 !== null) {
        add(armor3);
      }
    }
  }
}

function armorAddThickness(unit, params) {
  const armor = tonumber(params.armor, null);
  const add = tonumber(params.add, 0);
  const mult = tonumber(params.mult, 100);

  const armor2 = tonumber(params.armor2, null);
  const add2 = tonumber(params.add2, 0);
  const mult2 = tonumber(params.mult2, 100);

  const armor3 = tonumber(params.armor3, null);
  const add3 = tonumber(params.add3, 0);
  const mult3 = tonumber(params.mult3, 100);

  const armor4 = tonumber(params.armor4, null);
  const add4 = tonumber(params.add4, 0);
  const mult4 = tonumber(params.mult4, 100);

  const size = unit.armor.length;

  function mod(armorId, add, mult) {
    const a = unit.armor[armorId];
    a.value = Math.floor(a.value * mult / 100) + add / Constants.ENGINE_FLOAT_SHIFT;
  }

  if (size > 0) {
    mod(armor, add, mult);
    if (size > 1 && armor2 !== null) {
      mod(armor2, add2, mult2);
      if (size > 2 && armor3 !== null) {
        mod(armor3, add3, mult3);
        if (size > 3 && armor4 !== null) {
          mod(armor4, add4, mult4);
        }
      }
    }
  }
}

function rechargePeriodDec(unit, params) {
  const weaponId = tonumber(params.weapon, null);
  const turretId = tonumber(params.turret, null);
  const dec = tonumber(params.dec, 0);

  function processWeapon(weapon) {
    weapon.rechargePeriod = Number(weapon.rechargePeriod - dec / Constants.ENGINE_FLOAT_SHIFT).toFixed(1);
  }

  processTurretsAndWeapons(unit, turretId, weaponId, processWeapon);
}

function maxDistanceAdd(unit, params) {
  const weaponId = tonumber(params.weapon, null);
  const turretId = tonumber(params.turret, null);
  const add = tonumber(params.add, 0);

  function processWeapon(weapon) {
    weapon.distance.max = weapon.distance.max + add / Constants.ENGINE_FLOAT_SHIFT;
    weapon.distance.stop = weapon.distance.stop + add / Constants.ENGINE_FLOAT_SHIFT;
  }

  processTurretsAndWeapons(unit, turretId, weaponId, processWeapon);
}

function workEnable(unit, params) {
  const id = tonumber(params.id, null);
  const enabled = tobool(params.enable, true);
  const works = collectWorks(unit);

  works[id].enabled = enabled;
}

function regeneration(unit, params) {
  const add = tonumber(params.add, 0);
  unit.regenerationSpeed = unit.regenerationSpeed + add / Constants.ENGINE_FLOAT_SHIFT;
}

function buildingSpeedMult(unit, params) {
  const mult = tonumber(params.mult, 100);
  const buildingId = tonumber(params.building, null);

  function processBuilding(construction) {
    construction.constructionSpeed = Math.floor(construction.constructionSpeed * mult / 100);
  }

  if (buildingId === null) {
    for (const construction of unit.construction) {
      processBuilding(construction);
    }
  } else {
    processBuilding(unit.construction[buildingId]);
  }
}

function gatherBagSizeAdd(unit, params) {
  const add = tonumber(params.add, 0);
  const gatherId = tonumber(params.gather, null);

  function processGather(gather) {
    gather.bagSize = gather.bagSize + add / Constants.ENGINE_FLOAT_SHIFT;
  }

  if (gatherId === null) {
    for (const gather of unit.gather) {
      processGather(gather);
    }
  } else {
    processGather(unit.gather[gatherId]);
  }
}

function workReserveTimeMult(unit, params) {
  const mult = tonumber(params.mult, 100);
  const workId = tonumber(params.work, null);
  const workId2 = tonumber(params.work2, null);
  const workId3 = tonumber(params.work3, null);
  const works = collectWorks(unit);

  function processWork(work) {
    work.reserve.reserveTime = Math.floor(work.reserve.reserveTime * mult / 100);
  }

  if (workId === null) {
    for (const workId_ in works) {
      processWork(works[workId_]);
    }
  } else {
    processWork(works[workId]);
    if (workId2 !== null) {
      processWork(works[workId2]);
      if (workId3 !== null) {
        processWork(works[workId3]);
      }
    }
  }
}

function workReserveLimitAdd(unit, params) {
  const add = tonumber(params.add, 0);
  const workId = tonumber(params.work, null);
  const workId2 = tonumber(params.work2, null);
  const workId3 = tonumber(params.work3, null);
  const works = collectWorks(unit);

  function processWork(work) {
    work.reserve.reserveLimit = work.reserve.reserveLimit + add;
  }

  if (workId === null) {
    for (const workId_ in works) {
      processWork(works[workId_]);
    }
  } else {
    processWork(works[workId]);
    if (workId2 !== null) {
      processWork(works[workId2]);
      if (workId3 !== null) {
        processWork(works[workId3]);
      }
    }
  }
}

function storageMultiplierAdd(unit, params) {
  const add = tonumber(params.add, 0);
  unit.storageMultiplier = unit.storageMultiplier + Math.floor(Constants.ENGINE_STORAGE_MULTIPLIER * add);
}

function workPriceChange(unit, params) {
  const mult = tonumber(params.mult, 100);
  const add = tonumber(params.add, 0);
  const resourceId = tonumber(params.resource, null);
  const workId = tonumber(params.work, null);

  const work = collectWorks(unit)[workId];

  function processResource(resource) {
    resource.value = Math.floor(resource.value * mult / 100) + add / Constants.ENGINE_FLOAT_SHIFT;
  }

  if (resourceId === null) {
    processResource(work.cost[0]);
    processResource(work.cost[1]);
    processResource(work.cost[2]);
  } else {
    processResource(work.cost[resourceId]);
  }
}

function enable(unit, params) {
  const weaponId = tonumber(params.weapon, null);
  const turretId = tonumber(params.turret, null);
  const enabled = tobool(params.enable, true);

  function processWeapon(weapon) {
    weapon.enabled = enabled;
  }

  if (turretId === null) {
    const weapon = unit.weapons[weaponId];
    processWeapon(weapon);
  } else {
    const weapon = unit.turrets[turretId].weapons[weaponId];
    processWeapon(weapon);
  }
}

function abilityOnActionEnable(unit, params) {
  const enabled = tobool(params.enable, true);
  for (const ability of unit.abilities) {
    // 0 - self ability
    if (ability.containerType === 0) {
      ability.enabled = enabled;
    }
  }
}

function damageAdd(unit, params) {
  const weaponId = tonumber(params.weapon, null);
  const turretId = tonumber(params.turret, null);
  const add = tonumber(params.add, 0);
  const mult = tonumber(params.mult, 100);

  function processWeapon(weapon) {
    const damage = weapon.damage.damages[0];
    damage.value = Math.floor(damage.value * mult / 100) + add / Constants.ENGINE_FLOAT_SHIFT;
  }

  processTurretsAndWeapons(unit, turretId, weaponId, processWeapon);
}