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
export const gatherEfficiencyLookupTable = {
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
