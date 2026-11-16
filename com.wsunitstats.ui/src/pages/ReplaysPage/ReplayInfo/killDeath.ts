import type { Player, PlayerUnitStat } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

type UnitStatsMap = Map<string, PlayerUnitStat[]>;

export interface KillDeath {
  /** units killed / units lost */
  raw: number;
  /** cost value of units killed / cost value of units lost */
  value: number;
}

/**
 * Number and summed cost value of the units of a category map. Every unit counts, livestock as well:
 * livestock a player creates and then kills is counted both as killed and as lost
 */
const sumUnits = (unitStatsMap: UnitStatsMap, costValues: Map<string, number>) => {
  let count = 0;
  let value = 0;
  for (const units of unitStatsMap.values()) {
    for (const unit of units) {
      count += unit.number;
      value += unit.number * (costValues.get(unit.id) ?? 0);
    }
  }
  return { count, value };
};

/** Ratio as usual for K/D: without losses it is the number of kills itself */
const ratio = (kills: number, losses: number) => losses > 0 ? kills / losses : kills;

/**
 * @param costValues cost value by unit id (`costValue` of the units)
 * @return K/D of the player, undefined if the replay has no killed or lost units data
 */
export const calcKillDeath = (player: Player, costValues: Map<string, number>): KillDeath | undefined => {
  if (!player.unitsKilledOn || !player.unitsLostOn || !player.unitsKilledPlain || !player.unitsLostPlain) {
    return undefined;
  }
  const killed = sumUnits(player.unitsKilledPlain, costValues);
  const lost = sumUnits(player.unitsLostPlain, costValues);
  return {
    raw: ratio(killed.count, lost.count),
    value: ratio(killed.value, lost.value)
  };
};
