import type { Player, ReplayParseResult } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import type { ReplayExtraData } from '@/pages/ReplaysPage/ReplayInfo/replayAnalyzer';
import { calcMVPScore } from '@/pages/ReplaysPage/ReplayInfo/scoreCalculator';

/** Resources counted as shared: food, wood, iron (the ones resources spent counts) */
const SHARED_RESOURCE_IDS = [0, 1, 2];

/** Copy of an object of a class (replay structure classes) with some fields replaced */
const copyWith = <T extends object>(object: T, fields: Partial<T>): T =>
  Object.assign(Object.create(Object.getPrototypeOf(object)), object, fields);

/**
 * MVP scores with the resources each player sent to other players: a copy of the replay with the scores
 * and the MVP recalculated, or the replay itself if nobody sent anything
 */
export const withSharedResources = (replayInfo: ReplayParseResult, extraData: ReplayExtraData, debug = false): ReplayParseResult => {
  const sentByPlayer = new Map<number, number>();
  for (const transfer of extraData.resourceTransfers) {
    const sent = SHARED_RESOURCE_IDS.reduce((sum, resourceId) => sum + (transfer.amounts[resourceId] ?? 0), 0);
    sentByPlayer.set(transfer.senderId, (sentByPlayer.get(transfer.senderId) ?? 0) + sent);
  }
  if (sentByPlayer.size === 0) {
    return replayInfo;
  }

  const scores = new Map<number, number>();
  // the same choice as the parser: the highest score, the later player on a tie
  let mvp = { id: -1, score: 0 };
  replayInfo.players.forEach((player: Player) => {
    const input = player.mvpScoreInput;
    if (input == null) {
      return;
    }
    const sent = sentByPlayer.get(player.id) ?? 0;
    const score: number = sent > 0
      ? calcMVPScore({ ...input, resourcesSharedAvg: sent / Math.max(1, input.resourcePeriods) }, debug, player.nickname)
      : player.mvpScore;
    scores.set(player.id, score);
    if (score >= mvp.score) {
      mvp = { id: player.id, score };
    }
  });
  const players = replayInfo.players.map((player: Player) => copyWith(player, {
    mvpScore: scores.get(player.id) ?? player.mvpScore,
    isMvp: player.id === mvp.id
  }));
  return copyWith(replayInfo, { players });
};
