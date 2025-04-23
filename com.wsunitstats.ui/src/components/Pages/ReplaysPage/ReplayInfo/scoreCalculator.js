import { gatherEfficiencyLookupTable } from "./gatherEfficiencyLookupTable";
import { expDecay, calcArea } from "./mathUtils";

/**
 * Returns an object that describes gathering speed for the given time/age/nation
 */
export function getGatherEntry(prevAgeNation, currAgeNation, timeSinceLastAgeUp, timeLinePeriod, time) {
  function getOrDefaultNationEntry(ageNation) {
    const ageEntry = gatherEfficiencyLookupTable[ageNation[0]];
    const nationEntry = ageEntry[ageNation[1]] || ageEntry.default;
    return {
      worker: {
        value: nationEntry.worker?.value || ageEntry.default?.worker?.value || [0, 0, 0],
        upTime: nationEntry.worker?.upTime || ageEntry.default?.worker?.upTime || 0
      },
      boat: {
        value: nationEntry.boat?.value || ageEntry.default?.boat?.value || [0, 0, 0],
        upTime: nationEntry.boat?.upTime || ageEntry.default?.boat?.upTime || 0
      },
      tractor: {
        value: nationEntry.tractor?.value || ageEntry.default?.tractor?.value || [0, 0, 0],
        upTime: nationEntry.tractor?.upTime || ageEntry.default?.tractor?.upTime || 0
      },
      whEff: {
        value: nationEntry.whEff.value,
        upTime: nationEntry.whEff?.upTime || ageEntry.default?.whEff?.upTime || 0
      }
    };
  }

  const currNationEntry = getOrDefaultNationEntry(currAgeNation);
  const prevNationEntry = getOrDefaultNationEntry(prevAgeNation);
  const isInCurrentPeriod = (time - timeSinceLastAgeUp) <= timeLinePeriod;
  const currTimeK = (timeLinePeriod - timeSinceLastAgeUp) / timeLinePeriod;
  const prevTimeK = timeSinceLastAgeUp / timeLinePeriod;
  function getValueCountingTime(currUpTime, currVal, prevVal) {
    // check if upgr time passed and if it passed in currect timeLine frame
    const isEnoughTimePassed = (timeSinceLastAgeUp - currUpTime * 1000) >= 0;
    if (isEnoughTimePassed) {
      return isInCurrentPeriod ? currVal * currTimeK + prevVal * prevTimeK : currVal;
    } else {
      return prevVal;
    }
  }

  const gatherEntry = {
    worker: [
      getValueCountingTime(currNationEntry.worker.upTime, currNationEntry.worker.value[0], prevNationEntry.worker.value[0]),
      getValueCountingTime(currNationEntry.worker.upTime, currNationEntry.worker.value[1], prevNationEntry.worker.value[1]),
      getValueCountingTime(currNationEntry.worker.upTime, currNationEntry.worker.value[2], prevNationEntry.worker.value[2])
    ],
    boat: [
      getValueCountingTime(currNationEntry.boat.upTime, currNationEntry.boat.value[0], prevNationEntry.boat.value[0]),
      getValueCountingTime(currNationEntry.boat.upTime, currNationEntry.boat.value[1], prevNationEntry.boat.value[1]),
      getValueCountingTime(currNationEntry.boat.upTime, currNationEntry.boat.value[2], prevNationEntry.boat.value[2])
    ],
    tractor: [
      getValueCountingTime(currNationEntry.tractor.upTime, currNationEntry.tractor.value[0], prevNationEntry.tractor.value[0]),
      getValueCountingTime(currNationEntry.tractor.upTime, currNationEntry.tractor.value[1], prevNationEntry.tractor.value[1]),
      getValueCountingTime(currNationEntry.tractor.upTime, currNationEntry.tractor.value[2], prevNationEntry.tractor.value[2])
    ],
    whEff: getValueCountingTime(currNationEntry.whEff.upTime, currNationEntry.whEff.value, prevNationEntry.whEff.value)
  };

  // calc resource "value" coefficients for each worker type
  function calcK(speedEntry) {
    const values = [speedEntry[0], speedEntry[1], speedEntry[2]];
    const baseline = Math.max(...values);

    const foodK = baseline > 0 ? speedEntry[0] / baseline : 0;
    const woodK = baseline > 0 ? speedEntry[1] / baseline : 0;
    const ironK = baseline > 0 ? speedEntry[2] / baseline : 0;
    return [foodK, woodK, ironK];
  }
  const workerK = calcK(gatherEntry.worker);
  const boatK = calcK(gatherEntry.boat);
  const tractorK = calcK(gatherEntry.tractor);

  gatherEntry.worker.k = workerK;
  gatherEntry.boat.k = boatK;
  gatherEntry.tractor.k = tractorK;
  
  return gatherEntry;
}

export function calcGatherMetrics(gatherEntry, prevWorkers, currWorkers, resDelta, timeLinePeriod) {
  // avg workers per current timeline interval
  const avgWorkerNum = (prevWorkers.worker + currWorkers.worker) / 2;
  const avgBoatNum = (prevWorkers.boat + currWorkers.boat) / 2;
  const avgTractorNum = (prevWorkers.tractor + currWorkers.tractor) / 2;

  // calc gather efficiency
  const actualYield = [
    resDelta[0] / timeLinePeriod,
    resDelta[1] / timeLinePeriod,
    resDelta[2] / timeLinePeriod,
  ];
  const maxEstimateYield = [
    (gatherEntry.worker[0] * avgWorkerNum + gatherEntry.boat[0] * avgBoatNum + gatherEntry.tractor[0] * avgTractorNum) * gatherEntry.whEff,
    (gatherEntry.worker[1] * avgWorkerNum + gatherEntry.boat[1] * avgBoatNum + gatherEntry.tractor[1] * avgTractorNum) * gatherEntry.whEff,
    (gatherEntry.worker[2] * avgWorkerNum + gatherEntry.boat[2] * avgBoatNum + gatherEntry.tractor[2] * avgTractorNum) * gatherEntry.whEff
  ];
  const foodN = maxEstimateYield[0] > 0 ? actualYield[0] / maxEstimateYield[0] : 0;
  const woodN = maxEstimateYield[1] > 0 ? actualYield[1] / maxEstimateYield[1] : 0;
  const ironN = maxEstimateYield[2] > 0 ? actualYield[2] / maxEstimateYield[2] : 0;
  const gatherEff = foodN + woodN + ironN;

  const totalGatherers = avgWorkerNum + avgBoatNum*2 + avgTractorNum*3;

  // calc efficiency score points (how efficient gathering was)
  function calcEffScore(kEntry, refWhEfficiency) {
    // The more resources with less workers player has - the more score he has
    // The more reference (up to age) warehouse efficiency - the less score, to encourage faster warehouse upgrade
    // divided by 1000 to map resources to in-game values
    return totalGatherers > 0 ? (resDelta[0] * kEntry[0] + resDelta[1] * kEntry[1] + resDelta[2] * kEntry[2]) / (totalGatherers * refWhEfficiency * 1000) : 0;
  }
  const workerEffScore = calcEffScore(gatherEntry.worker.k, gatherEntry.whEff);
  const boatEffScore = calcEffScore(gatherEntry.boat.k, gatherEntry.whEff);
  const tractorEffScore = calcEffScore(gatherEntry.tractor.k, gatherEntry.whEff);
  const gatherEffScore = workerEffScore + boatEffScore + tractorEffScore;

  // calc value score points (how much was gathered)
  function calcValScore(kEntry) {
    // divided by timeLinePeriod to get value per sec
    return totalGatherers > 0 ? (resDelta[0] * kEntry[0] + resDelta[1] * kEntry[1] + resDelta[2] * kEntry[2]) / timeLinePeriod : 0;
  }
  const workerValScore = calcValScore(gatherEntry.worker.k);
  const boatValScore = calcValScore(gatherEntry.boat.k);
  const tractorValScore = calcValScore(gatherEntry.tractor.k);
  const gatherValScore = workerValScore + boatValScore + tractorValScore;

  // possible improvement: add correction coefficient to compensate mines in IR
  return {
    gatherEfficiency: gatherEff,
    gatherEfficiencyScore: gatherEffScore,
    gatherValueScore: gatherValScore
  };
}

export function calcResourceMetrics(resNow, resWas, resDelta, resCollected) {
  const resExpected = [
    resWas[0] + resDelta[0],
    resWas[1] + resDelta[1],
    resWas[2] + resDelta[2]
  ];

  const resSpent = [
    resExpected[0] - resNow[0],
    resExpected[1] - resNow[1],
    resExpected[2] - resNow[2]
  ];

  return {
    resNow: resNow.map(r => r / 1000),
    resSpent: resSpent.map(r => r / 1000),
    resDelta: resDelta.map(r => r / 1000),
    resCollected: resCollected.map(r => r / 1000)
  };
}

export const MVP_CONST = {
  playerKillK: 400,
  combatK: 1.2,
  unitKillK: 0.8,
  territoryK: 0.000025,
  resourcesSpentK: 0.25,
  firstWonderPoints: 600,
  firstWonderPointsDecayRate: 1/2000000,
  winWonderPoints: 250,
  wonderPoints: 150,
  wonderRefTime: 1590000,
  winTeamK: 1.2,
  looseTeamK: 1,
  armySizeK: 0.2,
  researchPointsK: 1,
  indirectGrowRate: 1/750000,
  armyScoreTimeFrames: 5
};

export function calcMVPScore(options, debug = false, nickname = '') {
  const {
    playerKillsData, 
    unitCombatPointsArray, // defined within time
    unitKillPointsArray, // defined as array of unit-points/number (final result)
    territorySum,
    resourcesSpentAvg,
    armySizeAvg,
    researchPoints, // -
    isWonder,
    isFirstWonder,
    firstWonderTime,
    isWinWonder,
    isWinTeam,
    survivalTime,
    matchTime = 1
  } = options;

  const wonderK = isWonder ? 1 : 0;
  const firstWonderK = isFirstWonder ? 1 : 0;
  const winWonderK = isWinWonder ? 1 : 0;
  const winTeamWonderK = isWinTeam ? 1 : 0;

  const firstWonderTimeValue = expDecay(firstWonderK * MVP_CONST.firstWonderPoints, MVP_CONST.firstWonderPointsDecayRate, firstWonderTime - MVP_CONST.wonderRefTime);
  const wdp = wonderK * MVP_CONST.wonderPoints + winTeamWonderK * (firstWonderTimeValue + winWonderK * MVP_CONST.winWonderPoints);
  // combat points are cumulative (each value is a sum of prev values)
  // we have to value early kills more than later, so take an avg calculated from area under curve of dataset
  const ucp = Math.sqrt(calcArea(unitCombatPointsArray)) * MVP_CONST.combatK;
  const ukp = unitKillPointsArray ? calcUnitKillPoints(unitKillPointsArray) * MVP_CONST.unitKillK : 0;
  // player kill points depend on how much unit kill points killer have
  const playerKillK = ucp / 2;
  const pkp = playerKillsData ? calcPlayerKillValue(playerKillsData) * playerKillK : 0;
  const ter = territorySum * MVP_CONST.territoryK * (1 - expDecay(1, MVP_CONST.indirectGrowRate, survivalTime));
  const res = resourcesSpentAvg * MVP_CONST.resourcesSpentK * (1 - expDecay(1, MVP_CONST.indirectGrowRate, survivalTime))**5;
  const arm = armySizeAvg * MVP_CONST.armySizeK;
  const tec = researchPoints * MVP_CONST.researchPointsK;

  const directPoints = pkp + ucp + ukp;
  const indirectPoints = ter + res;
  const bonusPoints = wdp + arm + tec;
  const winTeamK = isWinTeam ? MVP_CONST.winTeamK : MVP_CONST.looseTeamK;
  const result = winTeamK * (directPoints + indirectPoints + bonusPoints) * 1000 / matchTime;

  if (debug) {
    console.log(`=================================
    Player: ${nickname}
    Match time divider: ${matchTime / 1000}
    'Components:'
    Wonder flags (winTeam-firstWonder-winWonder): ${winTeamWonderK}-${firstWonderK}-${winWonderK}
    First Wonder Time: ${firstWonderTimeValue.toFixed(0)}
    Wonder: ${wdp.toFixed(0)}
    Player Kill: ${pkp.toFixed(0)}
    Unit Combat: ${ucp.toFixed(0)}
    Unit Kill: ${ukp.toFixed(0)}
    Territory: ${ter.toFixed(0)}
    Resources Spent: ${res.toFixed(0)}
    Army Size: ${arm.toFixed(0)}
    Researches: ${tec.toFixed(0)}
    'Groups:'
    Direct points: ${directPoints.toFixed(0)}
    Indirect points: ${indirectPoints.toFixed(0)}
    Bonus points: ${bonusPoints.toFixed(0)}
    Score: ${result.toFixed(0)}`);
  }

  return result;
}

// calc impact of kill, non-direct method
function calcPlayerKillValue(playerKillsData) {
  let playerValue = 0;
  playerKillsData.forEach((killEntry, killIndex) => {
    const playerArmyScore = findLatestArmyScore(killEntry.playerArmyScore);
    const teamArmyScore = Array.from(killEntry.teamArmyScore.values())
      .reduce((acc, score) => acc + findLatestArmyScore(score), 0);
    const teamMvpScore = Array.from(killEntry.teamInstantMvpScore.values())
      .reduce((acc, score) => acc + score, 0);
    const teamAvgMvpScore = killEntry.teamInstantMvpScore.size > 0 ? teamMvpScore / killEntry.teamInstantMvpScore.size : 1;

    // the later kill - the less points will be given
    const killValue = killEntry.victimMvpScore / (teamAvgMvpScore * Math.sqrt(killIndex + 1));
    const playerArmyValue = playerArmyScore / teamArmyScore;
    const playerMvpValue = 0.8 * killEntry.playerInstantMvpScore / teamMvpScore;
    playerValue += (playerArmyValue + playerMvpValue) * 0.5 * killValue;
  });
  return playerValue;
}

function findLatestArmyScore(armyScore) {
  return armyScore.slice(-MVP_CONST.armyScoreTimeFrames)
    .reduce((acc, score) => acc + score);
}

function calcUnitKillPoints(unitKillPointsArray) {
  return unitKillPointsArray.reduce((acc, entry) => acc + entry.points * entry.number, 0);
}