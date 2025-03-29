import getAgeNation from './ageNationFinder';
import {
  DatasetContainer,
  DatasetGroup,
  MultiRowDatasetContainer,
  TimeLineDataset,
  TimeLineMultiRowDataset
} from './datasetStructure';
import {
  calcGatherMetrics,
  calcMVPScore,
  calcResourceMetrics,
  getGatherEntry
} from './scoreCalculator';

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
  #playerScriptData;
  #context;
  #replayCode;

  // generated structures
  #playerResearchTimeLine;
  #factionTeams;
  #playerTeams;
  #playerSurvival;
  #playerWinners;
  #teamWinners;
  #winnerSurvivalTime;
  #isWonderWin;
  #groupMapByGameId;
  #groupMapByParsedId;
  #playerResearchesData;

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
      return new ReplayParseResult().addError(
        replayApiResponse.error,
        'Replay does not exist.'
      );
    }
    if (replayApiResponse.error === 6) {
      return new ReplayParseResult().addError(
        replayApiResponse.error,
        'War Selection API is unavailable due to the server maintenance. ' +
        'It can last up to several hours before endpoint will be available again. Please, try later'
      );
    }
    if (replayApiResponse.error !== 0) {
      return new ReplayParseResult().addError(
        replayApiResponse.error,
        `War Selection API responded with error [${replayApiResponse.error}]. ` +
        `Original description: ${replayApiResponse.description}`
      );
    }

    try {
      const replayApiResponseData = replayApiResponse.data;
      this.#matchData = replayApiResponseData.extraData?.['0'] && JSON.parse(replayApiResponseData.extraData['0']);
      this.#playersLost = replayApiResponseData.extraData?.['1'] && JSON.parse(replayApiResponseData.extraData['1']);
      this.#timeLine = replayApiResponseData.extraData?.['2'] && JSON.parse(replayApiResponseData.extraData['2']);
      this.#stats = replayApiResponseData.extraData?.['3'] && JSON.parse(replayApiResponseData.extraData['3']);
      this.#researches = replayApiResponseData.extraData?.['4'] && JSON.parse(replayApiResponseData.extraData['4']);
      this.#initData = replayApiResponseData.initData;
      this.#scriptParameters = this.#parseScriptParams(replayApiResponseData.initData.scriptParameters);
      this.#playerScriptData = JSON.parse(this.#scriptParameters.data).players;
      this.#version = replayApiResponseData?.version;
      this.#start = replayApiResponseData?.start;

      this.#isMatchDataOn = this.#matchData != null;
      this.#isPlayersLostOn = this.#playersLost != null;
      this.#isStatsOn = this.#stats != null;
      this.#isResearchesOn = this.#researches != null;
      // all data required to generate full timeline features
      this.#isTimelineOn = this.#timeLine != null && this.#isStatsOn && this.#isResearchesOn && this.#isPlayersLostOn;

      if (!this.#isMatchDataOn) {
        return new ReplayParseResult().addError(
          255,
          'Cannot parse replay data. Match data is absent in WS Games API response.'
        );
      }

      this.#playerResearchTimeLine = this.#generatePlayerResearchTimeLine();

      const teamEntries = this.#generateTeamsData();
      this.#factionTeams = teamEntries[0];
      this.#playerTeams = teamEntries[1];

      this.#playerSurvival = this.#isPlayersLostOn && this.#generateSurvivalMap();
      this.#addWinnersData();
      this.#isWonderWin = this.#isPlayersLostOn && this.#getIsWonderWin();
      this.#playerResearchesData = this.#generateResearchesData();

      const groupEntries = this.#parsePlayerGroups();
      this.#groupMapByGameId = groupEntries[0];
      this.#groupMapByParsedId = groupEntries[1];

      const timeLineData = this.#generateTimeLineData();
      const players = this.#parsePlayers(timeLineData.mvpScoreStructure);
      const teams = this.#parseTeams();
      const match = this.#parseMatch();

      return new ReplayParseResult().addSuccess(
        match,
        teams,
        players,
        timeLineData.charts,
        ReplayInfoParser.timeLinePeriod
      );
    } catch (error) {
      console.error(error);
      return new ReplayParseResult().addError(
        255,
        'Cannot parse replay data. Error: ' + error.message
      );
    }
  }

  #parseMatch() {
    const match = new Match();
    match.startTime = this.#start;
    match.duration = this.#matchData.duration * 1000;
    match.mode = MatchType.fromId(this.#matchData.mode).type;
    match.winnerTeams = Array.from(this.#teamWinners.keys());
    match.playersCount = this.#initData.players.length;
    match.factionsCount = this.#initData.factions;
    match.region = this.#matchData.region;
    match.gameVersion = this.#version;
    match.matchSeed = this.#initData.seed;
    match.isMatchmaking = this.#scriptParameters.matchmaking;
    match.creator = match.isMatchmaking ? 0 : this.#playerScriptData[this.#scriptParameters.creator].nickname;
    match.isDevMode = this.#scriptParameters.devMode;
    match.isComplete = this.#matchData.winners > 0;
    match.isWonderWin = this.#isWonderWin;
    match.replayCode = this.#replayCode;
    match.isMapGen = this.#initData.generatorData;
    match.isMapReleased = this.#initData.loadData?.releaseData !== 'false';
    match.mapCode = this.#initData.loadData?.mapCode.split('_')[0];
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
      team.color = TEAM_COLORS[teamId % 2];
    });
    return teamList;
  }

  #parsePlayers(mvpScoreData) {
    const playerList = [];
    const mvp = { index: 0, score: 0 };
    this.#playerScriptData.forEach((playerScriptEntry, playerId) => {
      const player = new Player();
      playerList[playerId] = player;

      const factionId = this.#getPlayerFaction(playerId);
      player.id = playerId;
      player.factionId = factionId;
      player.nickname = playerScriptEntry.name;
      player.isNicknameAutogenerated = !!playerScriptEntry.anonym;
      player.rating = playerScriptEntry.rating;
      player.team = this.#factionTeams.get(factionId);
      player.group = this.#groupMapByGameId.get(playerScriptEntry.group)?.id;
      player.color = FACTION_COLORS[factionId];
      player.isWinner = this.#playerWinners.has(playerId);

      if (this.#isPlayersLostOn) {
        player.survivalAvailable = true;
        player.survivalTime = this.#playerSurvival.get(playerId);
        player.isDead = this.#winnerSurvivalTime > player.survivalTime;
      }

      if (this.#isResearchesOn) {
        player.researchAvailable = true;
        const playerResearchEntry = this.#playerResearchesData.get(playerId);
        player.researches = playerResearchEntry.researches;
        player.isWonderBuilt = playerResearchEntry.isWonderBuilt;
        player.lastAgeResearch = playerResearchEntry.lastAgeResearch;
        player.isWonderWin = playerResearchEntry.isWonderWin;
        player.firstWonderTime = playerResearchEntry.firstWonderTime;
      }

      if (this.#isStatsOn) {
        player.unitsAvailable = true;
        player.unitsCreated = this.#parsePlayerUnits(factionId);
      }

      if (this.#isTimelineOn) {
        player.mvpScore = calcMVPScore({
          isWonder: player.isWonderBuilt,
          isWinTeam: this.#teamWinners.has(player.team),
          isFirstWonder: player.firstWonderTime > 0,
          isWinWonder: player.isWonderWin,
          firstWonderTime: player.firstWonderTime,
          researchPoints: 0,
          playerKillPoints: 0,
          survivalTime: player.survivalTime,
          ...mvpScoreData[playerId]
        }, true, player.nickname);
        mvp.score = mvp.score > player.mvpScore ? mvp.score : player.mvpScore;
        mvp.index = mvp.score > player.mvpScore ? mvp.index : playerId;
      }
    });

    playerList[mvp.index].isMvp = true;

    return playerList;
  }

  #parsePlayerGroups() {
    const playerGroupsByGameId = new Map();
    const playerGroupsByParsedId = new Map();

    this.#playerScriptData.forEach((playerScriptEntry, playerId) => {
      if (playerScriptEntry.group !== undefined) {
        const group = playerGroupsByGameId.get(playerScriptEntry.group);
        if (group === undefined) {
          const groupId = playerGroupsByGameId.size;
          const entry = { id: groupId, creator: { name: playerScriptEntry.name, id: playerId }, members: [playerId] };
          playerGroupsByGameId.set(playerScriptEntry.group, entry);
          playerGroupsByParsedId.set(groupId, entry);
        } else {
          group.members.push(playerId);
        }
      }
    });
    return [playerGroupsByGameId, playerGroupsByParsedId];
  }

  #generateTimeLineData() {
    if (!this.#isTimelineOn) {
      return [];
    }
    const metadata = [];
    const teamsCount = this.#initData.teams.length;
    const squadsCount = this.#groupMapByParsedId.size;
    const playersCount = this.#initData.players.length;

    const setupGroups = (container, kFunc,
      getTeamResult = (teamId) => {
        const playerTeam = this.#playerTeams.get(teamId);
        const allPlayersDead = !playerTeam.some(playerId => this.#winnerSurvivalTime === this.#playerSurvival.get(playerId));
        const isWinner = this.#teamWinners.has(teamId);
        const isWonderWin = playerTeam.some(playerId => this.#playerResearchesData.get(playerId).isWonderWin);
        return allPlayersDead ? 'death' : (isWinner ? (isWonderWin ? 'wonder' : 'win') : 'timeout');
      },
      getSquadResult = (squadId) => {
        const squad = this.#groupMapByParsedId.get(squadId);
        const allPlayersDead = !squad.members.some(playerId => this.#winnerSurvivalTime === this.#playerSurvival.get(playerId));
        const anyMemberWon = squad.members.some(playerId => this.#playerWinners.has(playerId));
        const anyMemberWonByWonder = squad.members.some(playerId => this.#playerResearchesData.get(playerId).isWonderWin);
        return allPlayersDead ? 'death' : (anyMemberWon ? (anyMemberWonByWonder ? 'wonder' : 'win') : 'timeout');
      },
      getPlayerResult = (playerId) => {
        const isDead = this.#winnerSurvivalTime > this.#playerSurvival.get(playerId);
        const isWinner = this.#playerWinners.has(playerId);
        const isWonderWin = this.#playerResearchesData.get(playerId).isWonderWin;
        return isDead ? 'death' : (isWinner ? (isWonderWin ? 'wonder' : 'win') : 'timeout');
      }) => {
      const teamDatasetGroup = new DatasetGroup('replayDatasetGroupTeams', 'teams');
      const squadDatasetGroup = new DatasetGroup('replayDatasetGroupSquads', 'squads');
      const playerDatasetGroup = new DatasetGroup('replayDatasetGroupPlayers', 'players');
      container.addDatasetGroup(teamDatasetGroup);
      container.addDatasetGroup(squadDatasetGroup);
      container.addDatasetGroup(playerDatasetGroup);

      const multiRow = container.isMultiRow;
      const rowNum = container.rowNum;
      const tlSize = this.#timeLine.length;

      let playerTeamCounter = 0;
      for (let i = 0; i < teamsCount; i++) {
        const playerTeam = this.#playerTeams.get(i);
        const playerTeamsNumber = Array.from(this.#playerTeams.values()).filter(arr => arr.length > 0).length;
        playerTeamCounter = playerTeam.length > 0 ? playerTeamCounter + 1 : playerTeamCounter;
        const leadingFaction = this.#getPlayerFaction(playerTeam[0]);
        const color = playerTeamsNumber === 2 ? TEAM_COLORS[i % 2].light : FACTION_COLORS[leadingFaction];
        const dataset = multiRow ? new TimeLineMultiRowDataset('replayTeam', true, playerTeamCounter, getTeamResult(i), rowNum, tlSize)
          : new TimeLineDataset('replayTeam', true, playerTeamCounter, getTeamResult(i), color, tlSize, kFunc);
        teamDatasetGroup.addDataset(dataset);
      }

      for (let i = 0; i < squadsCount; i++) {
        const dataset = multiRow ? new TimeLineMultiRowDataset('replaySquad', true, i + 1, getSquadResult(i), rowNum, tlSize)
          : new TimeLineDataset('replaySquad', true, i + 1, getSquadResult(i), FACTION_COLORS[i + 2], tlSize, kFunc);
        squadDatasetGroup.addDataset(dataset);
      }

      for (let i = 0; i < playersCount; i++) {
        const playerFaction = this.#getPlayerFaction(i);
        const playerNickname = this.#playerScriptData[i].name;
        const dataset = multiRow ? new TimeLineMultiRowDataset(playerNickname, false, null, getPlayerResult(i), rowNum, tlSize)
          : new TimeLineDataset(playerNickname, false, null, getPlayerResult(i), FACTION_COLORS[playerFaction], tlSize, kFunc);
        playerDatasetGroup.addDataset(dataset);
      }

      return {
        teams: teamDatasetGroup.datasets,
        squads: squadDatasetGroup.datasets,
        players: playerDatasetGroup.datasets
      };
    };

    // this are references to the same entities as containers above
    const unitCreatePointsDatasetContainer = new DatasetContainer('replayDatasetUnitCreatePoints');
    const unitCreatePointsData = setupGroups(unitCreatePointsDatasetContainer);

    const unitKillPointsDatasetContainer = new DatasetContainer('replayDatasetUnitKillPoints');
    const unitKillPointsData = setupGroups(unitKillPointsDatasetContainer);

    const landPointsDatasetContainer = new DatasetContainer('replayDatasetLandPoints');
    const landPointsData = setupGroups(landPointsDatasetContainer);

    const workerPointsDatasetContainer = new DatasetContainer('replayDatasetWorkerPoints');
    const workerPointsData = setupGroups(workerPointsDatasetContainer);

    const gatherEfficiencyDatasetContainer = new DatasetContainer('replayDatasetGatherEfficiency', 'percent');
    const gatherEfficiencyData = setupGroups(gatherEfficiencyDatasetContainer);

    // todo: remove or use
    //const gatherEffScoreDatasetContainer = new DatasetContainer('replayDatasetGatherEffScore');
    //const gatherEffScoreData = setupGroups(gatherEffScoreDatasetContainer);

    const gatherValueScoreDatasetContainer = new DatasetContainer('replayDatasetGatherValueScore');
    const gatherValueScoreData = setupGroups(gatherValueScoreDatasetContainer);

    const foodCollectedDatasetContainer = new DatasetContainer('replayDatasetFoodCollected');
    const foodCollectedData = setupGroups(foodCollectedDatasetContainer);
    const woodCollectedDatasetContainer = new DatasetContainer('replayDatasetWoodCollected');
    const woodCollectedData = setupGroups(woodCollectedDatasetContainer);
    const ironCollectedDatasetContainer = new DatasetContainer('replayDatasetIronCollected');
    const ironCollectedData = setupGroups(ironCollectedDatasetContainer);
    const foodNowDatasetContainer = new DatasetContainer('replayDatasetFoodNow');
    const foodNowData = setupGroups(foodNowDatasetContainer);
    const woodNowDatasetContainer = new DatasetContainer('replayDatasetWoodNow');
    const woodNowData = setupGroups(woodNowDatasetContainer);
    const ironNowDatasetContainer = new DatasetContainer('replayDatasetIronNow');
    const ironNowData = setupGroups(ironNowDatasetContainer);

    const resourcesCollectedDatasetContainer = new MultiRowDatasetContainer('replayDatasetResourcesCollected', RES_DATA.rows, RES_DATA.names, RES_DATA.colors, RES_DATA.icons);
    const resourcesCollectedData = setupGroups(resourcesCollectedDatasetContainer);
    const resourcesNowDatasetContainer = new MultiRowDatasetContainer('replayDatasetResourcesNow', RES_DATA.rows, RES_DATA.names, RES_DATA.colors, RES_DATA.icons);
    const resourcesNowData = setupGroups(resourcesNowDatasetContainer);
    const resourcesSpentDatasetContainer = new MultiRowDatasetContainer('replayDatasetResourcesSpent', RES_DATA.rows, RES_DATA.names, RES_DATA.colors, RES_DATA.icons);
    const resourcesSpentData = setupGroups(resourcesSpentDatasetContainer);

    const playerKillsDataMap = new Map();
    const playerTeams = Array.from(this.#playerTeams.entries()).filter(entry => entry[1].length > 0).map(entry => entry[0]);
    // only capture kill data for team matches (not for FFA, 1v1 and etc, since it makes no sence when only 1 player in team)
    const capturePlayerKillsData = playerTeams.length === 2 && playersCount > 2;
    // prefill entries
    for (let i = 0; i < playersCount; i++) {
      const factionId = this.#getPlayerFaction(i);
      const playerScriptEntry = this.#playerScriptData[i];
      metadata.push({
        factionId: factionId,
        teamId: this.#factionTeams.get(factionId),
        squadId: this.#groupMapByGameId.get(playerScriptEntry.group)?.id,
        ageNation: [0, 0], // pre-stone age abstract entry,
        workers: {
          worker: 10, // to fit standard matchmaking match count
          boat: 0,
          tractor: 0
        },
        resources: [0, 0, 0]
      });
    }

    for (let i = 0; i < this.#timeLine.length; i++) {
      const time = (i + 1) * ReplayInfoParser.timeLinePeriod; // end of timeline interval (time of measurement)
      const startTime = i * ReplayInfoParser.timeLinePeriod; // start of timeline interval
      const tlEntry = this.#timeLine[i];
      const unitCreateInfo = tlEntry[0];
      const unitKillInfo = tlEntry[1];
      const landInfo = tlEntry[2];
      const workerInfo = tlEntry[3];
      const resourceInfo = tlEntry[4];

      for (let playerId = 0; playerId < playersCount; playerId++) {
        const playerMetadata = metadata[playerId];
        const factionId = playerMetadata.factionId;
        const unitCreatePoints = unitCreateInfo[factionId];
        const unitKillPoints = unitKillInfo[factionId];
        const landPoints = landInfo[factionId];
        const workerPoints = workerInfo[factionId][0];

        const workerNum = workerInfo[factionId][1];
        const boatNum = workerInfo[factionId][2];
        const tractorNum = workerInfo[factionId][3];

        const resInfo = resourceInfo[factionId];
        const resDelta = [resInfo[0], resInfo[1], resInfo[2]];
        const resCollected = [resInfo[3], resInfo[4], resInfo[5]];
        const resNow = [resInfo[6], resInfo[7], resInfo[8]];
        const resWas = playerMetadata.resources;
        playerMetadata.resources = resNow;

        const teamId = playerMetadata.teamId;
        const squadId = playerMetadata.squadId;

        const resMetrics = calcResourceMetrics(
          resNow,
          resWas,
          resDelta,
          resCollected
        );

        if (this.#isTeamAlive(teamId, startTime)) {
          unitKillPointsData.teams[teamId].computeSum(i, unitKillPoints);
          resourcesCollectedData.teams[teamId].computeSum(i, resMetrics.resCollected);
          resourcesNowData.teams[teamId].computeSum(i, resMetrics.resNow);
          resourcesSpentData.teams[teamId].computeSum(i, resMetrics.resSpent);
          foodCollectedData.teams[teamId].computeSum(i, resMetrics.resCollected[0]);
          woodCollectedData.teams[teamId].computeSum(i, resMetrics.resCollected[1]);
          ironCollectedData.teams[teamId].computeSum(i, resMetrics.resCollected[2]);
          foodNowData.teams[teamId].computeSum(i, resMetrics.resNow[0]);
          woodNowData.teams[teamId].computeSum(i, resMetrics.resNow[1]);
          ironNowData.teams[teamId].computeSum(i, resMetrics.resNow[2]);
        }

        if (squadId != null && this.#isSquadAlive(squadId, startTime)) {
          unitKillPointsData.squads[squadId].computeSum(i, unitKillPoints);
          resourcesCollectedData.squads[squadId].computeSum(i, resMetrics.resCollected);
          resourcesNowData.squads[squadId].computeSum(i, resMetrics.resNow);
          resourcesSpentData.squads[squadId].computeSum(i, resMetrics.resSpent);
          foodCollectedData.squads[squadId].computeSum(i, resMetrics.resCollected[0]);
          woodCollectedData.squads[squadId].computeSum(i, resMetrics.resCollected[1]);
          ironCollectedData.squads[squadId].computeSum(i, resMetrics.resCollected[2]);
          foodNowData.squads[squadId].computeSum(i, resMetrics.resNow[0]);
          woodNowData.squads[squadId].computeSum(i, resMetrics.resNow[1]);
          ironNowData.squads[squadId].computeSum(i, resMetrics.resNow[2]);
        }

        if (this.#isPlayerAlive(playerId, startTime)) {
          // Gather efficiency and score
          const currAgeNation = getAgeNation(time, this.#playerResearchTimeLine[playerId]);

          // update metadata values for next timeline
          const prevAgeNation = playerMetadata.ageNation;
          const prevWorkers = playerMetadata.workers;

          const currWorkers = { worker: workerNum, boat: boatNum, tractor: tractorNum };
          playerMetadata.ageNation = currAgeNation;
          playerMetadata.workers = currWorkers;

          const timeSinceLastAgeUp = this.#findPrevAgeResearchPassedTime(time, playerId);
          const gatherEntry = getGatherEntry(prevAgeNation, currAgeNation, timeSinceLastAgeUp, ReplayInfoParser.timeLinePeriod, time)
          const gatherMetrics = calcGatherMetrics(gatherEntry, prevWorkers, currWorkers, resDelta, ReplayInfoParser.timeLinePeriod);

          // TODO kills/army points ratio
          //const combatScore = 0;
          // TODO spent/collected resources ratio
          //const managementScore = 0;
          // TODO wonder, land capture, win/loose
          //const activityScore = 0;
          //const score = ecoMetrics.gatherScore + combatScore + managementScore + activityScore;

          unitCreatePointsData.players[playerId].push(unitCreatePoints, time);
          unitKillPointsData.players[playerId].push(unitKillPoints, time);
          landPointsData.players[playerId].push(landPoints);
          workerPointsData.players[playerId].push(workerPoints);
          gatherEfficiencyData.players[playerId].push(gatherMetrics.gatherEfficiency);
          //gatherEffScoreData.players[playerId].push(gatherMetrics.gatherEfficiencyScore);
          gatherValueScoreData.players[playerId].push(gatherMetrics.gatherValueScore);
          resourcesCollectedData.players[playerId].push(resMetrics.resCollected);
          resourcesNowData.players[playerId].push(resMetrics.resNow);
          resourcesSpentData.players[playerId].push(resMetrics.resSpent);
          foodCollectedData.players[playerId].push(resMetrics.resCollected[0]);
          woodCollectedData.players[playerId].push(resMetrics.resCollected[1]);
          ironCollectedData.players[playerId].push(resMetrics.resCollected[2]);
          foodNowData.players[playerId].push(resMetrics.resNow[0]);
          woodNowData.players[playerId].push(resMetrics.resNow[1]);
          ironNowData.players[playerId].push(resMetrics.resNow[2]);

          unitCreatePointsData.teams[teamId].computeSum(i, unitCreatePoints);
          landPointsData.teams[teamId].computeSum(i, landPoints);
          workerPointsData.teams[teamId].computeSum(i, workerPoints);
          gatherEfficiencyData.teams[teamId].computeAvg(i, gatherMetrics.gatherEfficiency);
          //gatherEffScoreData.teams[teamId].computeAvg(i, gatherMetrics.gatherEfficiencyScore);
          gatherValueScoreData.teams[teamId].computeSum(i, gatherMetrics.gatherValueScore);

          if (squadId != null) {
            unitCreatePointsData.squads[squadId].computeSum(i, unitCreatePoints);
            landPointsData.squads[squadId].computeSum(i, landPoints);
            workerPointsData.squads[squadId].computeSum(i, workerPoints);
            gatherEfficiencyData.squads[squadId].computeAvg(i, gatherMetrics.gatherEfficiency);
            //gatherEffScoreData.squads[squadId].computeAvg(i, gatherMetrics.gatherEfficiencyScore);
            //gatherValueScoreData.squads[squadId].computeSum(i, gatherMetrics.gatherValueScore);
          }

          // add data for player kill points once per each killed player in this timeframe
          if (!this.#isPlayerAlive(playerId, time) && capturePlayerKillsData) {
            const deadPlayerTeam = this.#factionTeams.get(factionId);
            const killerTeam = playerTeams.filter(team => deadPlayerTeam !== team)[0];
            const killerTeamInstantMvpScore = new Map();
            const killerTeamArmyScore = new Map();
            const victimMvpScore = calcMVPScore({
              isWonder: false,
              isWinTeam: false,
              isFirstWonder: false,
              isWinWonder: false,
              firstWonderTime: 0,
              researchPoints: 0,
              playerKillPoints: 0,
              survivalTime: time,
              unitKillPointsArray: unitKillPointsData.players[playerId].values,
              territorySum: landPointsData.players[playerId].pointsSum,
              resourcesSpentAvg: resourcesSpentData.players[playerId].pointsAvgLocal,
              armySizeAvg: unitCreatePointsData.players[playerId].pointsAvgLocalK,
            });

            for (let i = 0; i < playersCount; i++) {
              const team = metadata[i].teamId;
              // if player was alive at the start of timeframe - he is counted as contributor
              if (i !== playerId && this.#isPlayerAlive(i, startTime) && team === killerTeam) {
                const instantMVPScore = calcMVPScore({
                  isWonder: false,
                  isWinTeam: false,
                  isFirstWonder: false,
                  isWinWonder: false,
                  firstWonderTime: 0,
                  researchPoints: 0,
                  playerKillPoints: 0,
                  survivalTime: time,
                  unitKillPointsArray: unitKillPointsData.players[i].values,
                  territorySum: landPointsData.players[i].pointsSum,
                  resourcesSpentAvg: resourcesSpentData.players[i].pointsAvgLocal,
                  armySizeAvg: unitCreatePointsData.players[i].pointsAvgLocalK,
                });

                const playerKillEntry = {
                  victimMvpScore: victimMvpScore,
                  playerInstantMvpScore: instantMVPScore,
                  playerArmyScore: unitCreatePointsData.players[i].values,
                  teamInstantMvpScore: killerTeamInstantMvpScore,
                  teamArmyScore: killerTeamArmyScore
                };

                const entries = playerKillsDataMap.get(i) || [];
                entries.push(playerKillEntry);
                playerKillsDataMap.set(i, entries);
                killerTeamInstantMvpScore.set(i, instantMVPScore);
                killerTeamArmyScore.set(i, unitCreatePointsData.players[i].values);
              }
            }
          }
        }
      }
    }

    const timeLineMvpScoreStructure = [];
    for (let playerId = 0; playerId < playersCount; playerId++) {
      timeLineMvpScoreStructure.push({
        // kill points calculated from area of figure below the curve to
        playerKillsData: playerKillsDataMap.get(playerId),
        unitKillPointsArray: unitKillPointsData.players[playerId].values,
        territorySum: landPointsData.players[playerId].pointsSum,
        resourcesSpentAvg: resourcesSpentData.players[playerId].pointsAvgLocal,
        armySizeAvg: unitCreatePointsData.players[playerId].pointsAvgLocalK,
      });
    }

    const resultFull = [
      unitCreatePointsDatasetContainer,
      unitKillPointsDatasetContainer,
      landPointsDatasetContainer,
      workerPointsDatasetContainer,
      gatherEfficiencyDatasetContainer,
      gatherValueScoreDatasetContainer,
      resourcesCollectedDatasetContainer,
      resourcesNowDatasetContainer,
      foodCollectedDatasetContainer,
      woodCollectedDatasetContainer,
      ironCollectedDatasetContainer,
      foodNowDatasetContainer,
      woodNowDatasetContainer,
      ironNowDatasetContainer
    ];
    const resultFiltered = [];
    resultFull.forEach(container => {
      // filter out empty datasets
      container.datasetGroups.forEach(datasetGroup => {
        const nonEmptyDatasets = datasetGroup.datasets.filter(dataset =>
          dataset.values.length > 0 && (!Array.isArray(dataset.values[0]) || dataset.values[0].length > 0));
        datasetGroup.datasets = nonEmptyDatasets;
      });
      // filter out empty dataset groups
      const nonEmptyGroups = container.datasetGroups.filter(datasetGroup => datasetGroup.datasets.length > 0);
      if (nonEmptyGroups.length > 0) {
        container.datasetGroups = nonEmptyGroups;
        resultFiltered.push(container);
      }
    });
    return {
      charts: resultFiltered,
      mvpScoreStructure: timeLineMvpScoreStructure
    };
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

  #generateTeamsData() {
    const factionTeams = new Map();
    const playerTeams = new Map();
    const teams = this.#initData.teams;
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const teamPlayers = [];
      for (let j = 0; j < team.length; j++) {
        const factionId = team[j];
        factionTeams.set(factionId, i);
        const playerId = this.#getFactionPlayer(factionId);
        if (playerId != null) {
          teamPlayers.push(playerId);
        }
      }
      playerTeams.set(i, teamPlayers);
    }
    return [factionTeams, playerTeams];
  }

  #generateResearchesData() {
    const playerData = new Map();
    if (this.#isResearchesOn) {
      const wonderLeaderCandidates = [];
      const firstWonderCandidates = [];
      this.#playerScriptData.forEach((_, playerId) => {
        const researchResult = this.#parsePlayerResearches(playerId);
        const isWonder = researchResult.wonderTime ? true : false;
        const isWinner = this.#playerWinners.has(playerId);
        if (isWonder) {
          const entry = { playerId: playerId, researchTime: researchResult.wonderTime };
          firstWonderCandidates.push(entry)
          if (isWinner && this.#isWonderWin) {
            wonderLeaderCandidates.push(entry);
          }
        }
        playerData.set(playerId, {
          researches: researchResult.researches,
          isWonderBuilt: isWonder,
          isWonderWin: false,
          firstWonderTime: 0,
          lastAgeResearch: researchResult.lastAgeResearch
        });
      });

      const firstWonder = firstWonderCandidates.reduce((acc, current) =>
        acc.researchTime < current.researchTime ? acc : current,
        { playerId: -1, researchTime: Number.MAX_VALUE }
      );
      if (firstWonder.playerId >= 0) {
        playerData.get(firstWonder.playerId).firstWonderTime = firstWonder.researchTime;
      }

      this.#getWonderLeaders(wonderLeaderCandidates).forEach(playerId =>
        playerData.get(playerId).isWonderWin = true
      );
    }
    
    return playerData;
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
    const stringToHex = (str) => {
      return str.split('')
        .map(c => c.charCodeAt(0).toString(16).padStart(4, '0'))
        .join('');
    };

    const hexToString = (hex) => {
      return hex.split(/(\w\w\w\w)/g)
        .filter(p => !!p)
        .map(c => String.fromCharCode(parseInt(c, 16)))
        .join('');
    };

    // escape names in data json to hex strings to not falsely parse commas inside them as entry separators
    const escapedParams = scriptParamsString.replaceAll(/"name":"((?:(?!(?<!\\)").)+)"/g, (_, g1) =>
      `"name":"${stringToHex(g1)}"`);

    // now all commas followed by key name symbols
    // basically everything except double quote,
    // since every valid comma in json should be followed
    // by the double quoted key and there are no plain value json arrays in the api for now
    // potentially, could be a problem if json will contain an array of plain values separated by comma somewhen
    const regexp = /([a-zA-Z0-9]+)=((?:(?!,[a-zA-Z0-9]).)+)/g;
    const matches = escapedParams.matchAll(regexp);
    const result = {};
    for (const match of matches) {
      const key = match[1];
      // unescape names (if value contains them)
      let unescapedValue = match[2].replaceAll(/"name":"([^"]+)"/g, (_, g1) =>
        `"name":"${hexToString(g1)}"`);
      // crutches for different data recorded in different game versions with different API versions and etc
      if (unescapedValue.startsWith('"') && unescapedValue.endsWith('"')) {
        // trime double quote characters from the string
        unescapedValue = unescapedValue.slice(1, -1);
      }
      if (key === 'data') {
        // remove escaping characters
        unescapedValue = unescapedValue.replaceAll('\\,', ',').replaceAll('\\\\', '\\');
      }
      result[key] = unescapedValue;
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
      if (research.type === 'ageTransition') {
        lastAgeResearch = id;
      }

      if (research.type === 'wonderTransition') {
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

  #getWonderLeaders(wonderLeaderCandidates) {
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

      return wonderLeaders.players;
    }
    return [];
  }

  #isPlayerAlive(playerId, time) {
    if (!this.#isPlayersLostOn) {
      return true;
    }

    return time < this.#playerSurvival.get(playerId);
  }

  #isSquadAlive(squadId, time) {
    if (!this.#isPlayersLostOn) {
      return true;
    }
    const squadMembers = this.#groupMapByParsedId.get(squadId).members;
    return squadMembers.some((playerId) => time < this.#playerSurvival.get(playerId));
  }

  #isTeamAlive(teamId, time) {
    if (!this.#isPlayersLostOn) {
      return true;
    }
    const teamMembers = this.#playerTeams.get(teamId);
    return teamMembers.some((playerId) => time < this.#playerSurvival.get(playerId));
  }

  #findPrevAgeResearchPassedTime(time, playerId) {
    const researchTimeline = this.#playerResearchTimeLine[playerId];

    for (let i = researchTimeline.length - 1; i >= 0; i--) {
      const researchEntry = researchTimeline[i];
      const rTime = researchEntry[0];
      const id = researchEntry[1];
      const research = this.#context.researches[id];
      const timeDiff = time - rTime;
      if (research.type === 'ageTransition' && timeDiff >= 0) {
        return timeDiff;
      }
    }

    return time;
  }
}

class ReplayParseResult {
  error;
  players;
  teams;
  match;
  message;
  timeLine;
  timeLinePeriod;

  addError(error, message) {
    this.error = error;
    this.message = message;
    return this;
  }

  addSuccess(match, teams, players, timeLine, timeLinePeriod) {
    this.error = 0;
    this.match = match;
    this.teams = teams;
    this.players = players;
    this.timeLine = timeLine;
    this.timeLinePeriod = timeLinePeriod;
    return this;
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

class MatchType {
  id;
  type;

  constructor(id, type) {
    this.id = id;
    this.type = type;
  }

  static #values = new Map([
    [0, 'replayMatchTypeFFA'],
    [1, 'replayMatchTypeTeamMatch'],
    [2, 'replayMatchTypeArmageddon'],
    [3, 'replayMatchTypeSurvival'],
    [4, 'replayMatchTypeRank1'],
    [5, 'replayMatchTypeRank2'],
    [6, 'replayMatchTypeSandbox'],
    [7, 'replayMatchTypeTOW'],
    [8, 'replayMatchTypeCustom'],
    [9, 'replayMatchTypeMafia'],
    [255, 'replayMatchTypeUndef']
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
    [0, 'replaySymmetryTypeNo'],
    [1, 'replaySymmetryTypeVertical'],
    [2, 'replaySymmetryTypeVerticalFlipped'],
    [3, 'replaySymmetryTypeHorizontal'],
    [4, 'replaySymmetryTypeHorizontalFlipped'],
    [5, 'replaySymmetryTypeDiagonal'],
    [6, 'replaySymmetryTypeDiagonalReverse'],
    [7, 'replaySymmetryTypeRandom'],
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

// taken from WS
const FACTION_COLORS = [
  '#7f7f7f',
  '#dadada',
  '#ff0000',
  '#bfff3f',
  '#00bfff',
  '#ffbf00',
  '#bf007f',
  '#7f00ff',
  '#00ffbf',
  '#ffff00',
  '#ff007f',
  '#00007f',
  '#7fbf7f',
  '#007fff',
  '#ff7f00',
  '#bf00bf',
  '#3fbf00',
  '#bfbf7f',
  '#ffbf7f',
  '#7f0000',
  '#333366',
  '#3fff00',
  '#ffff7f',
  '#ff3f7f',
  '#7f7fff',
  '#7fbf3f',
  '#bf7f00',
  '#ff00ff',
  '#bfbfff',
  '#7fff7f',
  '#ffffbf',
  '#ff7fbf',
  '#3f3fbf',
  '#dfff7f',
  '#ffbfbf',
  '#ff7fff',
  '#3f7fbf',
  '#3f7f3f',
  '#ff7f7f',
  '#bf00ff',
  '#7fbfff',
  '#007f00',
  '#bf7f7f',
  '#7f00bf',
  '#bfffff',
  '#bfbf00',
  '#bf3f3f',
  '#3f003f',
  '#00bfbf',
  '#bf0000',
  '#ffbfff',
  '#00bf7f',
  '#7f3f3f',
  '#7fbfbf',
  '#7f7f00',
  '#3f0000',
  '#bf7fbf',
  '#bfffbf',
  '#7f3f7f',
  '#00ffff',
  '#7fffbf',
  '#007f7f',
  '#7f007f',
  '#0000b3',
  '#bfbfbf'
];

const TEAM_COLORS = [
  {
    dark: '#5a3d3d',
    light: '#ffa2a2'
  },
  {
    dark: '#3b5158',
    light: '#a2d8ff'
  }
];

const RES_DATA = {
  names: ['resourceFood', 'resourceWood', 'resourceIron'],
  colors: ['#d84946', '#89411e', '#a29999'],
  icons: ['food', 'wood', 'iron'],
  rows: 3
};
