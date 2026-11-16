import { DatasetContainer, DatasetGroup, TimeLineDataset } from './datasetStructure';
import type { Player } from './replayStructure';
import type { ReplayExtraData, ReplayPlayerActivity } from './replayAnalyzer';

/**
 * Shortest pause between two actions that counts as idle time, seconds. Measured on 40 replays (~400 players):
 * the number of pauses drops fast with their length up to ~20 s (normal play: waiting for units, watching a fight),
 * longer pauses follow a much slower decline and are the real inactivity
 */
export const IDLE_MIN_PAUSE = 30;

/** Average actions per minute over the length of the activity data (see `findPlayerActivity`) */
export const calcApm = (activity: ReplayPlayerActivity): number | undefined => {
  const minutes = activity.actions.length * activity.step / 60;
  return minutes > 0 ? activity.actions.reduce((sum, count) => sum + count, 0) / minutes : undefined;
};

/**
 * Sum of the long pauses in the activity, seconds: between actions, before the first one and after the last one
 * (a player who stops playing until the end); short pauses are not counted
 */
export const calcIdleTime = (activity: ReplayPlayerActivity): number => {
  let idle = 0;
  // the step before the activity: the pause before the first action counts as well
  let lastActive = -1;
  const addPause = (steps: number) => {
    const pause = steps * activity.step;
    if (pause >= IDLE_MIN_PAUSE) {
      idle += pause;
    }
  };
  activity.actions.forEach((count, index) => {
    if (count > 0) {
      addPause(index - lastActive - 1);
      lastActive = index;
    }
  });
  addPause(activity.actions.length - lastActive - 1);
  return idle;
};

/**
 * Activity of the player in the match until the player left it: the replay goes on for a while after the end
 * of the match, those actions are not counted
 * @param matchDurationMs `Match.duration`
 * @param defeatTimeMs when the player was defeated, if the activity should end there as well
 */
export const findPlayerActivity = (extraData: ReplayExtraData | null | undefined, playerId: number, matchDurationMs: number,
  defeatTimeMs?: number): ReplayPlayerActivity | undefined => {
  const activity = extraData?.activity.find(entry => entry.playerId === playerId);
  if (!activity) {
    return undefined;
  }
  const leave = extraData!.connections.find(event => event.playerId === playerId && event.type === 'leave');
  const endSec = Math.min(matchDurationMs / 1000, leave?.time ?? Infinity, (defeatTimeMs ?? Infinity) / 1000);
  return { ...activity, actions: activity.actions.slice(0, Math.ceil(endSec / activity.step)) };
};

const getPlayerResult = (player: Player) =>
  player.isDead ? 'death' : (player.isWinner ? (player.isWonderWin ? 'wonder' : 'win') : 'timeout');

/**
 * Chart data of the number of actions of the players in each period of the time line (the last period of a player
 * can be shorter). The line of a player ends when the player is defeated or leaves
 * @param periodMs length of a time line period
 * @param matchDurationMs `Match.duration`
 */
export const buildActivityChart = (players: Player[], extraData: ReplayExtraData, periodMs: number, matchDurationMs: number) => {
  const container = new DatasetContainer('replayDatasetActivity');
  const group = new DatasetGroup('replayDatasetGroupPlayers', 'players', []);
  container.addDatasetGroup(group);
  const periodSec = periodMs / 1000;

  for (const player of players) {
    const activity = findPlayerActivity(extraData, player.id, matchDurationMs);
    if (!activity) {
      continue;
    }
    const totalSec = Math.min(activity.actions.length * activity.step, matchDurationMs / 1000);
    const endSec = player.isDead && player.survivalOn ? Math.min(totalSec, player.survivalTime / 1000) : totalSec;
    const periods = Math.ceil(endSec / periodSec);
    const dataset = new TimeLineDataset(player.nickname, false, null, getPlayerResult(player), player.color, periods);
    dataset.playerId = player.id;
    for (let period = 0; period < periods; period++) {
      const start = period * periodSec;
      const end = Math.min(endSec, start + periodSec);
      let actions = 0;
      for (let step = Math.floor(start / activity.step); step < Math.min(activity.actions.length, end / activity.step); step++) {
        actions += activity.actions[step];
      }
      dataset.push(actions, end * 1000);
    }
    group.addDataset(dataset);
  }
  return group.datasets.length > 0 ? container : undefined;
};
