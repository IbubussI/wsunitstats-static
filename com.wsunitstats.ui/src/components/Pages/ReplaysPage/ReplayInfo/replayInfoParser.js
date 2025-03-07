import getAgeNation from "./ageNationFinder";
import { calcEcoMetrics } from "./scoreCalculator";

export class ReplayInfoParser {
  static timeLinePeriod = 30000; //ms

  #matchData;
  #playersLost; // optional
  #timeLine; // optional
  #stats; // optional
  #researches; // optional, undef for players who didn't take anything
  #initData;
  #start;
  #version;
  #scriptParameters;
  #context;
  #replayCode;

  // generated structures
  #playerResearchTimeLine;
  #factionTeams;
  #playerSurvival; // optional
  #playerWinners; // optional
  #teamWinners; // optional
  #winnerSurvivalTime; // optional
  #isWonderWin;

  #timeLinePlayerData;

  #isMatchDataOn;
  #isPlayersLostOn;
  #isTimelineOn;
  #isStatsOn;
  #isResearchesOn;

  constructor(context, replayCode) {
    this.#context = context;
    this.#replayCode = replayCode;
  }

  parse(replayApiResponse) {
    if (replayApiResponse.error === 2) {
      return {
        error: replayApiResponse.error,
        message: 'Replay does not exist.'
      };
    }
    if (replayApiResponse.error === 6) {
      return {
        error: replayApiResponse.error,
        message: 'War Selection API is unavailable due to the server maintenance. ' +
          'It can last up to several hours before endpoint will be available again. Please, try later'
      };
    }
    if (replayApiResponse.error !== 0) {
      return {
        error: replayApiResponse.error,
        message: `War Selection API responded with error [${replayApiResponse.error}]. ` +
          `Original description: ${replayApiResponse.description}`
      };
    }

    try {
      const replayApiResponseData = replayApiResponse.data;
      this.#matchData = JSON.parse(replayApiResponseData.extraData["0"]);
      this.#playersLost = replayApiResponseData.extraData["1"] && JSON.parse(replayApiResponseData.extraData["1"]);
      this.#timeLine = replayApiResponseData.extraData["2"] && JSON.parse(replayApiResponseData.extraData["2"]);
      this.#stats = replayApiResponseData.extraData["3"] && JSON.parse(replayApiResponseData.extraData["3"]);
      this.#researches = replayApiResponseData.extraData["4"] && JSON.parse(replayApiResponseData.extraData["4"]);
      this.#initData = replayApiResponseData.initData;
      this.#scriptParameters = this.#parseScriptParams(replayApiResponseData.initData.scriptParameters);
      this.#version = replayApiResponseData.version;
      this.#start = replayApiResponseData.start;

      this.#isMatchDataOn = this.#matchData != null;
      this.#isPlayersLostOn = this.#playersLost != null;
      this.#isTimelineOn = this.#timeLine != null;
      this.#isStatsOn = this.#stats != null;
      this.#isResearchesOn = this.#researches != null;

      if (!this.#isMatchDataOn) {
        return {
          error: 255,
          message: "Cannot parse replay data. Match data is absent in WS Games API response."
        };
      }

      this.#playerResearchTimeLine = this.#generatePlayerResearchTimeLine();
      this.#factionTeams = this.#generateTeamsMap();
      this.#playerSurvival = this.#isPlayersLostOn && this.#generateSurvivalMap();
      this.#addWinnersData();
      this.#isWonderWin = this.#isPlayersLostOn && this.#getIsWonderWin();

      this.#timeLinePlayerData = this.#generateTimeLineData();
      const players = this.#parsePlayers();
      const teams = this.#parseTeams();
      const match = this.#parseMatch();

      return {
        error: 0,
        players: players,
        teams: teams,
        match: match
      };
    } catch (error) {
      console.error(error);
      return {
        error: 255,
        message: "Cannot parse replay data. Error: " + error.message
      };
    }
  }

  #parseMatch() {
    const match = new Match();
    match.startTime = this.#start;
    match.duration = this.#matchData.duration * 1000;
    match.mode = MatchType.fromId(this.#matchData.mode).type;
    match.winnerTeams = Array.from(this.#teamWinners.keys());
    match.playersCount = this.#matchData.players.length;
    match.factionsCount = this.#initData.factions;
    match.region = this.#matchData.region;
    match.gameVersion = this.#version;
    match.matchSeed = this.#initData.seed;
    match.isMatchmaking = this.#scriptParameters.matchmaking;
    match.creator = match.isMatchmaking ? 0 : this.#matchData.players[this.#scriptParameters.creator][0];
    match.isDevMode = this.#scriptParameters.devMode;
    match.isComplete = this.#matchData.winners > 0;
    match.isWonderWin = this.#isWonderWin;
    match.replayCode = this.#replayCode;
    match.isMapGen = this.#initData.generatorData;
    match.isMapReleased = this.#initData.loadData?.releaseData !== "false";
    match.mapCode = this.#initData.loadData?.mapCode.split("_")[0];
    match.mapSymmetry = SymmetryType.fromId(this.#initData.generatorData?.mapParameters?.generatorParameters?.symmetry).type;
    return match;
  }

  #parseTeams() {
    const teamData = this.#initData.teams;
    const teamList = [];
    teamData.forEach((teamFactions, teamId) => {
      const team = new Team();
      teamList.push(team);

      team.id = teamId;
      team.factions = teamFactions;
      team.players = teamFactions.map((factionId) => this.#getFactionPlayer(factionId)).filter(e => e !== null);
      team.isWinner = this.#teamWinners.has(teamId);
      team.isPlayerTeam = team.players.some(playerId => playerId !== null);
      team.color = teamId % 2;
    });
    return teamList;
  }

  #parsePlayers() {
    const playerScriptData = JSON.parse(this.#scriptParameters.data).players;
    const playerList = [];
    const playerGroups = new Map();

    const wonderLeaderCandidates = [];
    playerScriptData.forEach((playerScriptEntry, playerId) => {
      const player = new Player();
      playerList[playerId] = player;

      const factionId = this.#getPlayerFaction(playerId);
      player.id = playerId;
      player.factionId = factionId;
      player.nickname = playerScriptEntry.name;
      player.isNicknameAutogenerated = !!playerScriptEntry.anonym;
      player.rating = playerScriptEntry.rating;
      player.team = this.#factionTeams.get(factionId);
      player.group = this.#getPlayerGroup(playerScriptEntry, playerGroups);
      player.color = FACTION_COLORS[factionId];
      player.isWinner = this.#playerWinners.has(playerId);

      if (this.#isPlayersLostOn) {
        player.survivalAvailable = true;
        player.survivalTime = this.#playerSurvival.get(playerId);
        player.isDead = this.#winnerSurvivalTime > player.survivalTime;
      }

      if (this.#isResearchesOn) {
        player.researchAvailable = true;
        const researchResult = this.#parsePlayerResearches(playerId);
        player.researches = researchResult.researches;
        player.isWonderBuilt = researchResult.wonderTime ? true : false;
        if (player.isWonderBuilt && player.isWinner && this.#isWonderWin) {
          wonderLeaderCandidates.push({ playerId: playerId, researchTime: researchResult.wonderTime });
        }
        player.lastAgeResearch = researchResult.lastAgeResearch;
        player.isWonderWin = false;
      }

      if (this.#isStatsOn) {
        player.unitsAvailable = true;
        player.unitsCreated = this.#parsePlayerUnits(factionId);
      }

      if (this.#isTimelineOn && this.#isStatsOn && this.#isResearchesOn && this.#isPlayersLostOn) {
        player.mvpScore = this.#calculateMVPScore(playerId); // todo remove this or add some logic
        player.timeLine = this.#timeLinePlayerData[playerId];
      }
    });

    this.#addWonderLeaders(wonderLeaderCandidates, playerList);
    return playerList;
  }

  #generateTimeLineData() {
    const timeLinePlayerData = [];
    if (this.#isTimelineOn) {
      const metadata = [];
      const playersCount = this.#initData.players.length;
      // prefill entries
      for (let i = 0; i < playersCount; i++) {
        timeLinePlayerData.push(new PlayerTimeLine(ReplayInfoParser.timeLinePeriod));
        metadata.push({
          factionId: this.#getPlayerFaction(i),
          ecoScore: 0,
          managementScore: 0,
          combatScore: 0,
          prevAgeNation: [0, 0], // pre-stone age abstract entry,
          prevWorkers: {
            worker: 10, // to fit standard matchmaking match count
            boat: 0,
            tractor: 0
          }
        });
      }

      for (let i = 0; i < this.#timeLine.length; i++) {
        const time = (i + 1) * ReplayInfoParser.timeLinePeriod;
        const tlEntry = this.#timeLine[i];
        const unitCreateInfo = tlEntry[0];
        const unitKillInfo = tlEntry[1];
        const landInfo = tlEntry[2];
        const workerInfo = tlEntry[3];
        const resourceInfo = tlEntry[4];
        for (let playerId = 0; playerId < playersCount; playerId++) {
          const factionId = metadata[playerId].factionId;
          const unitCreatePoints = unitCreateInfo[factionId];
          const unitKillPoints = unitKillInfo[factionId];
          const landPoints = landInfo[factionId];
          const workerPoints = workerInfo[factionId][0];

          const workerNum = workerInfo[factionId][1];
          const boatNum = workerInfo[factionId][2];
          const tractorNum = workerInfo[factionId][3];

          const foodDelta = resourceInfo[factionId][0];
          const woodDelta = resourceInfo[factionId][1];
          const ironDelta = resourceInfo[factionId][2];

          const foodCollected = resourceInfo[factionId][3];
          const woodCollected = resourceInfo[factionId][4];
          const ironCollected = resourceInfo[factionId][5];

          const foodNow = resourceInfo[factionId][6];
          const woodNow = resourceInfo[factionId][7];
          const ironNow = resourceInfo[factionId][8];

          const playerEntry = timeLinePlayerData[playerId];
          playerEntry.unitCreatePoints.push(unitCreatePoints);
          playerEntry.unitKillPoints.push(unitKillPoints);
          playerEntry.landPoints.push(landPoints);
          playerEntry.workerPoints.push(workerPoints);

          if (this.#isAlive(playerId, time)) {
            const playerMetadata = metadata[playerId];

            // Gather efficiency and score
            const currAgeNation = getAgeNation(time, this.#playerResearchTimeLine[playerId]);

            // update metadata values for next timeline
            const prevAgeNation = playerMetadata.prevAgeNation;
            const prevWorkers = playerMetadata.prevWorkers;
            const currWorkers = { worker: workerNum, boat: boatNum, tractor: tractorNum };
            playerMetadata.prevAgeNation = currAgeNation;
            playerMetadata.prevWorkers = currWorkers;
            const timeSinceLastAgeUp = this.#findPrevAgeResearchPassedTime(time, playerId);
            const ecoMetrics = calcEcoMetrics(prevAgeNation, currAgeNation, prevWorkers, [foodDelta, woodDelta, ironDelta],
              currWorkers, timeSinceLastAgeUp, ReplayInfoParser.timeLinePeriod, time);

            // TODO army/kill points ratio
            const combatScore = 0;
            // TODO collected/spent resources ratio
            const managementScore = 0;
            // TODO wonder, land capture, win/loose
            const activityScore = 0;
            const score = ecoMetrics.ecoScore + combatScore + managementScore + activityScore;

            playerEntry.ecoEfficiency.push(ecoMetrics.ecoEfficiency);
            playerEntry.ecoScore.push(ecoMetrics.ecoScore);
            playerEntry.totalScore.push(score);
            playerEntry.totalScoreSum += score;
          }
        }
      }
    }
    return timeLinePlayerData;
  }

  #addWinnersData() {
    this.#playerWinners = new Set();
    this.#teamWinners = new Set();
    const winnersBitset = this.#matchData.winners;
    const playersCount = this.#initData.players.length;
    this.#winnerSurvivalTime = -1;
    for (let i = 0; i < playersCount; i++) {
      if ((winnersBitset & (1 << i)) !== 0) {
        const faction = this.#getPlayerFaction(i);
        const team = this.#factionTeams.get(faction);
        this.#teamWinners.add(team);
        this.#playerWinners.add(i);
        if (this.#isPlayersLostOn) {
          const survTime = this.#playerSurvival.get(i) || -1;
          this.#winnerSurvivalTime = Math.max(this.#winnerSurvivalTime, survTime);
        }
      }
    }
  }

  #generatePlayerResearchTimeLine() {
    const playerResearchesList = [];
    // check for incomplete replay data
    if (this.#researches) {
      const playersCount = this.#initData.players.length;
      for (let i = 0; i < playersCount; i++) {
        const factionId = this.#getPlayerFaction(i);
        const playerResearches = this.#researches[factionId];
        playerResearchesList.push(playerResearches || []);
      }
    }
    return playerResearchesList;
  }

  #generateSurvivalMap() {
    const result = new Map();
    const survList = this.#playersLost;
    for (let i = 0; i < survList.length; i++) {
      const playerSurvEntry = survList[i];
      const playerId = playerSurvEntry[0];
      const survTime = playerSurvEntry[1];
      result.set(playerId, survTime);
    }
    return result;
  }

  #generateTeamsMap() {
    const result = new Map();
    const teams = this.#initData.teams;
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      for (let j = 0; j < team.length; j++) {
        const factionId = team[j];
        result.set(factionId, i);
      }
    }
    return result;
  }

  #getIsWonderWin() {
    // check for incomplete replay data
    if (this.#winnerSurvivalTime === -1) {
      return false;
    }

    return Array.from(this.#playerSurvival.entries()).some(([playerId, survTime]) =>
      !this.#playerWinners.has(playerId) && this.#winnerSurvivalTime <= survTime
    );
  }

  #getPlayerGroup(playerScriptEntry, playerGroups) {
    if (playerScriptEntry.group !== undefined) {
      let groupId = playerGroups.get(playerScriptEntry.group);
      if (groupId === undefined) {
        groupId = playerGroups.size + 1;
        playerGroups.set(playerScriptEntry.group, groupId);
      }
      return groupId;
    }
  }

  #getFactionPlayer(factionId) {
    const playerBitsets = this.#initData.players;
    for (let i = 0; i < playerBitsets.length; i++) {
      const playerBitset = playerBitsets[i];
      if ((playerBitset & (1 << factionId)) !== 0) {
        return i;
      }
    }
    return null;
  }

  #getPlayerFaction(playerId) {
    const playerBitset = this.#initData.players[playerId];
    return getSetBitPositions(playerBitset)[0];
  }

  // not used
  #getPlayerTeam(playerId) {
    const factionId = this.#getPlayerFaction(playerId);
    return this.#getFactionTeam(factionId);
  }

  // not used
  #getFactionTeam(factionId) {
    return this.#factionTeams.get(factionId);
  }

  #parseScriptParams(scriptParamsString) {
    const regexp = /([a-zA-Z0-9]+)=((?:(?!,[a-zA-Z0-9]).)+)/g;
    const matches = scriptParamsString.matchAll(regexp);
    const result = {};
    for (const match of matches) {
      result[match[1]] = match[2];
    }
    return result;
  }

  #parsePlayerResearches(playerId) {
    const researchTimeline = this.#playerResearchTimeLine[playerId];
    const researches = [];
    let lastAgeResearch;
    let wonderTime;
    researchTimeline.forEach((researchEntry) => {
      const time = researchEntry[0];
      const id = researchEntry[1];
      const research = this.#context.researches[id];

      const playerResearch = new PlayerResearch();
      playerResearch.id = id;
      playerResearch.takenTime = time;
      researches.push(playerResearch);

      // list is sorted by time in WS API
      if (research.type === "ageTransition") {
        lastAgeResearch = id;
      }

      if (research.type === "wonderTransition") {
        wonderTime = time;
      }
    });

    return {
      researches: researches,
      lastAgeResearch: lastAgeResearch,
      wonderTime: wonderTime
    };
  }

  #parsePlayerUnits(factionId) {
    const statsEntry = this.#stats[factionId].unitsCreated;
    const units = new Map();
    for (const [unitTypeId, number] of Object.entries(statsEntry)) {
      const unitCreated = new PlayerUnitCreated();
      unitCreated.id = unitTypeId;
      unitCreated.number = number;
      const unitCategory = this.#context.units[unitTypeId].category;
      const unitEntry = units.get(unitCategory);
      if (unitEntry != null) {
        unitEntry.push(unitCreated)
      } else {
        units.set(unitCategory, [unitCreated]);
      }
    }
    return units;
  }

  #addWonderLeaders(wonderLeaderCandidates, playerList) {
    if (wonderLeaderCandidates.length > 0) {
      // unfortunately there is no way to determine who built the wonder first in case
      // time is the same (it should be extremely rare case), so leaders are multiple
      const wonderLeaders = { time: Number.MAX_VALUE, players: [] };
      wonderLeaderCandidates.forEach((entry) => {
        const time = entry.researchTime;
        // find the very first wonder
        if (wonderLeaders.time > time) {
          wonderLeaders.time = time;
          wonderLeaders.players = [entry.playerId];
        } else if (wonderLeaders.time === time) {
          wonderLeaders.players.push(entry.playerId);
        }
      });

      wonderLeaders.players.forEach((playerId) => {
        playerList[playerId].isWonderWin = true;
      });
    }
  }

  #calculateMVPScore(playerId) {
    // todo: remove or add something here
    const playerEntry = this.#timeLinePlayerData[playerId];
    return playerEntry.totalScoreSum;
  }

  #isAlive(playerId, time) {
    if (!this.#isPlayersLostOn) {
      return true;
    }

    return time < this.#playerSurvival.get(playerId);
  }

  #findPrevAgeResearchPassedTime(time, playerId) {
    const researchTimeline = this.#playerResearchTimeLine[playerId];

    for (let i = researchTimeline.length - 1; i >= 0; i--) {
      const researchEntry = researchTimeline[i];
      const rTime = researchEntry[0];
      const id = researchEntry[1];
      const research = this.#context.researches[id];
      const timeDiff = time - rTime;
      if (research.type === "ageTransition" && timeDiff > 0) {
        return timeDiff;
      }
    }

    return time;
  }
}

class Match {
  startTime;
  duration;
  mode;
  winnerTeams;
  playersCount;
  factionsCount;
  region;
  gameVersion;
  matchSeed;
  isMatchmaking;
  creator;
  isDevMode;
  isComplete;
  isWonderWin;
  replayCode;
  isMapGen;
  isMapReleased;
  mapCode;
  mapSymmetry;
}

class Team {
  id;
  factions;
  players;
  isWinner;
  isPlayerTeam;
  color;
}

class Player {
  id;
  // assumption that palyer controls only one faction
  // if there will be more - restructuring and complication of data structures is required
  factionId;
  nickname;
  isNicknameAutogenerated;
  rating;
  team;
  group;
  survivalTime;
  isWinner;
  isDead;
  color;
  researches;
  isWonderBuilt;
  isWonderWin;
  lastAgeResearch;
  unitsCreated;
  mvpScore;
  timeLine;

  researchAvailable = false;
  survivalAvailable = false;
  unitsAvailable = false;
}

class PlayerResearch {
  id;
  takenTime;
  researchContext;
}

class PlayerUnitCreated {
  id;
  number;
}

class PlayerTimeLine {
  unitCreatePoints;
  unitKillPoints;
  landPoints;
  workerPoints;
  ecoEfficiency;
  ecoScore;
  totalScore;

  totalScoreSum;
  timeLinePeriod;

  constructor(period) {
    // init 0 point, since timeline starts with 30 sec
    this.unitCreatePoints = [0];
    this.unitKillPoints = [0];
    this.landPoints = [0];
    this.workerPoints = [0];
    this.ecoEfficiency = [0];
    this.ecoScore = [0];
    this.totalScore = [0];

    this.totalScoreSum = 0;
    this.timeLinePeriod = period;
  }
}

class MatchType {
  id;
  type;

  constructor(id, type) {
    this.id = id;
    this.type = type;
  }

  static #values = new Map([
    [0, "replayMatchTypeFFA"],
    [1, "replayMatchTypeTeamMatch"],
    [2, "replayMatchTypeArmageddon"],
    [3, "replayMatchTypeSurvival"],
    [4, "replayMatchTypeRank1"],
    [5, "replayMatchTypeRank2"],
    [6, "replayMatchTypeSandbox"],
    [7, "replayMatchTypeTOW"],
    [8, "replayMatchTypeCustom"],
    [9, "replayMatchTypeMafia"],
    [255, "replayMatchTypeUndef"]
  ]);

  static fromId(id) {
    const actualId = MatchType.#values.has(id) ? id : 255;
    const type = MatchType.#values.get(actualId);
    return new MatchType(actualId, type);
  }
}

class SymmetryType {
  id;
  type;

  constructor(id, type) {
    this.id = id;
    this.type = type;
  }

  static #values = new Map([
    [0, "replaySymmetryTypeNo"],
    [1, "replaySymmetryTypeVertical"],
    [2, "replaySymmetryTypeVerticalFlipped"],
    [3, "replaySymmetryTypeHorizontal"],
    [4, "replaySymmetryTypeHorizontalFlipped"],
    [5, "replaySymmetryTypeDiagonal"],
    [6, "replaySymmetryTypeDiagonalReverse"],
    [7, "replaySymmetryTypeRandom"],
  ]);

  static fromId(id) {
    const actualId = SymmetryType.#values.has(id) ? id : 0;
    const type = SymmetryType.#values.get(actualId);
    return new SymmetryType(actualId, type);
  }
}

function getSetBitPositions(bitset) {
  const result = [];
  for (let i = 0; i < 64; ++i) {
    if ((bitset & (1 << i)) !== 0) {
      result.push(i);
    }
  }
  return result;
}

function expDecay(Q, rate, time) {
  return Q*(Math.exp(-time/rate));
}

// taken from WS
const FACTION_COLORS = [
  "#7f7f7f",
  "#dadada",
  "#ff0000",
  "#bfff3f",
  "#00bfff",
  "#ffbf00",
  "#bf007f",
  "#7f00ff",
  "#00ffbf",
  "#ffff00",
  "#ff007f",
  "#00007f",
  "#7fbf7f",
  "#007fff",
  "#ff7f00",
  "#bf00bf",
  "#3fbf00",
  "#bfbf7f",
  "#ffbf7f",
  "#7f0000",
  "#333366",
  "#3fff00",
  "#ffff7f",
  "#ff3f7f",
  "#7f7fff",
  "#7fbf3f",
  "#bf7f00",
  "#ff00ff",
  "#bfbfff",
  "#7fff7f",
  "#ffffbf",
  "#ff7fbf",
  "#3f3fbf",
  "#dfff7f",
  "#ffbfbf",
  "#ff7fff",
  "#3f7fbf",
  "#3f7f3f",
  "#ff7f7f",
  "#bf00ff",
  "#7fbfff",
  "#007f00",
  "#bf7f7f",
  "#7f00bf",
  "#bfffff",
  "#bfbf00",
  "#bf3f3f",
  "#3f003f",
  "#00bfbf",
  "#bf0000",
  "#ffbfff",
  "#00bf7f",
  "#7f3f3f",
  "#7fbfbf",
  "#7f7f00",
  "#3f0000",
  "#bf7fbf",
  "#bfffbf",
  "#7f3f7f",
  "#00ffff",
  "#7fffbf",
  "#007f7f",
  "#7f007f",
  "#0000b3",
  "#bfbfbf"
];
