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
  "35": turretDamageAdd // 187789004 - not exists anymore
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
    // deep copy the unit to not modify loaded and cached original one
    const unitCopy = JSON.parse(JSON.stringify(unit));
    if (researchesParam) {
      const researchesIds = researchesParam.split(',');
      for (let researchId of researchesIds) {
        const research = unitCopy.applicableResearches.filter(v => v.gameId === Number(researchId))[0];
        for (let upgrade of research.upgrades) {
          const applyScript = UPGRADE_SCRIPTS[upgrade.programId];
          applyScript(unitCopy, upgrade.parameters);
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

function processTurretsAndWeapons(unit, turretId, weaponId, weaponConsumer) {
  function processWeapons(weapons) {
    if (weaponId === -1) {
      for (const weapon of weapons) {
        weaponConsumer(weapon);
      }
    } else {
      weaponConsumer(weapons[weaponId]);
    }
  }

  if (turretId === -1) {
    processWeapons(unit.weapons);
  } else if (turretId < 0) {
    for (const turret of unit.turrets) {
      processWeapons(turret.weapon);
    }
  } else {
    processWeapons(unit.turrets[turretId].weapon);
  }
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
  const gatherId = tonumber(params.gather, -1);
  const add = tonumber(params.add, 0);
  unit.gather[gatherId].perSecond = unit.gather[gatherId].perSecond + add / Constants.TICK_RATE;
}

function setDamageArea(unit, params) {
  const weaponId = tonumber(params.weapon, -1);
  const turretId = tonumber(params.turret, -1);
  const area = params.area;

  function processWeapon(weapon) {
    if (DAMAGE_AREA_TYPE[area]) {
      weapon.damage.areaType = DAMAGE_AREA_TYPE[area];
    } else {
      weapon.damage.areaType = "N/A";
    }
  }

  if (area) {
    processTurretsAndWeapons(unit, turretId, weaponId, processWeapon);
  }
}

function spreadMult(unit, params) {
  const weaponId = tonumber(params.weapon, -1);
  const turretId = tonumber(params.turret, -1);
  const mult = tonumber(params.mult, 100);

  function processWeapon(weapon) {
    weapon.spread = Math.floor(weapon.spread * mult / 100);
  }

  processTurretsAndWeapons(unit, turretId, weaponId, processWeapon);
}

function armorAddSize(unit, params) {
  const addVal = tonumber(params.add, 0);
  const armor = tonumber(params.armor, -1);
  const armor2 = tonumber(params.armor2, -1);
  const armor3 = tonumber(params.armor3, -1);

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

  if (armor > 0) {
    add(armor);
    if (armor2 > 0) {
      add(armor2);
      if (armor3 > 0) {
        add(armor3);
      }
    }
  }
}

function armorAddThickness(unit, params) {
}

function rechargePeriodDec(unit, params) {
}

function maxDistanceAdd(unit, params) {
}

function workEnable(unit, params) {
}

function regeneration(unit, params) {
}

function buildingSpeedMult(unit, params) {
}

function gatherBagSizeAdd(unit, params) {
}

function workReserveTimeMult(unit, params) {
}

function workReserveLimitAdd(unit, params) {
}

function storageMultiplierAdd(unit, params) {
}

function workPriceChange(unit, params) {
}

function enable(unit, params) {
}

function abilityOnActionEnable(unit, params) {
}

function damageAdd(unit, params) {
}

function turretDamageAdd(unit, params) {
}