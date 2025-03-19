/*
worker gather speed table (res per sec):
        food wood iron	wh eff
stone	  1.1  1.1  -	    100%
stoneU	1.3  1.3  -	    100%
eu	    1.3  1.4  0.7	  110%
euU	    1.6  1.6  0.9	  110%
as	    1.5  1.2  0.6	  110%
asU	    1.5  1.3  0.8	  110%
westEu  1.5  1.5  0.8	  140%
westEuU 1.5  1.6  1.0	  140%
eastEu  1.6  1.5  0.8	  140%
eastEuU 1.6  1.5  1.0   140%
westAs  1.6  1.4  0.8	  130%
eastAs  1.6  1.4  0.8	  130%
ir	    1.8  1.8  1.2	  150%
china	  1.8  1.5  0.8	  150%
*/
const gatherEfficiencyLookupTable = {
  "0": { // Stone age
    "1": {
      worker: {
        value: [1.3, 1.3, 0],
        upTime: 30
      },
      whEff: {
        value: 1
      }
    },
    default: { // spawn time (before stone upgrades)
      worker: {
        value: [1.1, 1.1, 0]
      },
      whEff: {
        value: 1
      }
    }
  },
  "1": { // Bronze age
    "2": { // Europe
      worker: {
        value: [1.3, 1.4, 0.7],
        upTime: 10 // upgr workers
      },
      boat: {
        value: [6, 0, 0]
      },
      whEff: {
        value: 1.1,
        upTime: 10 // upgr wh
      }
    },
    "3": { // Asia
      worker: {
        value: [1.5, 1.2, 0.6],
        upTime: 10 // upgr workers
      },
      boat: {
        value: [4.7, 0, 0]
      },
      whEff: {
        value: 1.1,
        upTime: 10 // upgr wh
      }
    }
  },
  "2": { // Iron age
    "2": { // Europe
      worker: {
        value: [1.6, 1.6, 0.9],
        upTime: 60 // upgr wood/iron
      },
      boat: {
        value: [6, 0, 0]
      },
      whEff: {
        value: 1.1
      }
    },
    "3": { // Asia
      worker: {
        value: [1.5, 1.3, 0.8],
        upTime: 60 // upgr wood/iron
      },
      boat: {
        value: [4.7, 0, 0]
      },
      whEff: {
        value: 1.1
      }
    }
  },
  "3": { // Med age
    "4": { // Western Europe
      worker: {
        value: [1.5, 1.6, 1.0],
        upTime: 60 // upgr workers + stone/iron
      },
      boat: {
        value: [7.2, 0, 0],
        upTime: 30 // upgr port + fisher
      },
      whEff: {
        value: 1.3,
        upTime: 10 // upgr wh
      }
    },
    "5": { // Eastern Europe
      worker: {
        value: [1.5, 1.5, 0.8],
        upTime: 60 // upgr workers + stone/iron
      },
      boat: {
        value: [7.2, 0, 0],
        upTime: 30 // upgr port + fisher
      },
      whEff: {
        value: 1.3,
        upTime: 10 // upgr wh
      }
    },
    "6": { // Western Asia
      worker: {
        value: [1.6, 1.4, 0.8],
        upTime: 10 // upgr workers
      },
      boat: {
        value: [4.7, 0, 0]
      },
      whEff: {
        value: 1.3,
        upTime: 15 // upgr wh
      }
    },
    "7": { // Eastern Asia
      worker: {
        value: [1.6, 1.4, 0.8]
      },
      boat: {
        value: [6, 0, 0],
        upTime: 40 // upgr port + fisher
      },
      whEff: {
        value: 1.3,
        upTime: 15 // upgr wh
      }
    }
  },
  "4": { // Late med age
    "4": { // Western Europe
      worker: {
        value: [1.5, 1.6, 1.0]
      },
      boat: {
        value: [7.2, 0, 0]
      },
      whEff: {
        value: 1.4,
        upTime: 60 // upgr efficiency
      }
    },
    "5": { // Eastern Europe
      worker: {
        value: [1.5, 1.5, 0.8]
      },
      boat: {
        value: [7.2, 0, 0]
      },
      whEff: {
        value: 1.4,
        upTime: 60 // upgr efficiency
      }
    },
    "6": { // Western Asia
      worker: {
        value: [1.6, 1.4, 0.8]
      },
      boat: {
        value: [4.7, 0, 0]
      },
      whEff: {
        value: 1.4,
        upTime: 60 // upgr efficiency
      }
    },
    "7": { // Eastern Asia
      worker: {
        value: [1.6, 1.4, 0.8]
      },
      boat: {
        value: [6, 0, 0]
      },
      whEff: {
        value: 1.4,
        upTime: 60 // upgr efficiency
      }
    }
  },
  "5": { // IR 1
    "15": { // China
      worker: {
        value: [1.8, 1.5, 0.8],
        upTime: 20 // upgr workers
      },
      boat: {
        value: [8, 0, 0],
        upTime: 40
      },
      whEff: {
        value: 1.5,
        upTime: 30 // upgr wh
      }
    },
    default: { // All nations
      worker: {
        value: [1.8, 1.8, 1.2],
        upTime: 60 // upgr workers
      },
      boat: {
        value: [10, 0, 0],
        upTime: 120 // upgr port + fisher
      },
      tractor: {
        value: [9, 0, 0]
      },
      whEff: {
        value: 1.5,
        upTime: 30 // upgr wh
      }
    },
  },
  "6": { // IR 2
    "9": { // GB
      boat: {
        value: [20, 0, 0],
        upTime: 120 // upgr fish catching
      },
      whEff: {
        value: 1.5
      }
    },
    "15": { // China
      worker: {
        value: [1.8, 1.5, 0.8]
      },
      boat: {
        value: [8, 0, 0]
      },
      whEff: {
        value: 1.5
      }
    },
    "16": { // Japan
      boat: {
        value: [20, 0, 0],
        upTime: 120 // upgr fish catching
      },
      whEff: {
        value: 1.5
      }
    },
    default: { // All nations
      worker: {
        value: [1.8, 1.8, 1.2]
      },
      boat: {
        value: [10, 0, 0]
      },
      tractor: {
        value: [9, 0, 0]
      },
      whEff: {
        value: 1.5
      }
    }
  }
};

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

  return {
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
}

export function calcGatherMetrics(gatherEntry, prevWorkers, currWorkers, res, timeLinePeriod) {
  // avg workers per current timeline interval
  const avgWorkerNum = (prevWorkers.worker + currWorkers.worker) / 2;
  const avgBoatNum = (prevWorkers.boat + currWorkers.boat) / 2;
  const avgTractorNum = (prevWorkers.tractor + currWorkers.tractor) / 2;

  // calc gather efficiency
  const actualYield = [
    res[0] / timeLinePeriod,
    res[1] / timeLinePeriod,
    res[2] / timeLinePeriod,
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
  const totalGatherers = avgWorkerNum + avgBoatNum*2 + avgTractorNum*3;

  // calc efficiency score points (how efficient gathering was)
  function calcEffScore(kEntry, refWhEfficiency) {
    // The more resources with less workers player has - the more score he has
    // The more reference (up to age) warehouse efficiency - the less score, to encourage faster warehouse upgrade
    // divided by 1000 to map resources to in-game values
    return totalGatherers > 0 ? (res[0] * kEntry[0] + res[1] * kEntry[1] + res[2] * kEntry[2]) / (totalGatherers * refWhEfficiency * 1000) : 0;
  }
  const workerEffScore = calcEffScore(workerK, gatherEntry.whEff);
  const boatEffScore = calcEffScore(boatK, gatherEntry.whEff);
  const tractorEffScore = calcEffScore(tractorK, gatherEntry.whEff);
  const gatherEffScore = workerEffScore + boatEffScore + tractorEffScore;

  // calc value score points (how much was gathered)
  function calcValScore(kEntry) {
    return totalGatherers > 0 ? (res[0] * kEntry[0] + res[1] * kEntry[1] + res[2] * kEntry[2]) / 1000 : 0;
  }
  const workerValScore = calcValScore(workerK);
  const boatValScore = calcValScore(boatK);
  const tractorValScore = calcValScore(tractorK);
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
