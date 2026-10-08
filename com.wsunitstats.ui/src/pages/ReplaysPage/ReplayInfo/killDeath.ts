import type { Player, PlayerUnitStat } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

type UnitStatsMap = Map<string, PlayerUnitStat[]>;

export interface KillDeath {
  /** units killed / units lost */
  raw: number;
  /** kill value of units killed / kill value of units lost */
  value: number;
}

/**
 * Number and summed kill value of the units of a category map. Every unit counts, livestock as well:
 * livestock a player creates and then kills is counted both as killed and as lost
 */
const sumUnits = (unitStatsMap: UnitStatsMap, killValues: Map<string, number>) => {
  let count = 0;
  let value = 0;
  for (const units of unitStatsMap.values()) {
    for (const unit of units) {
      count += unit.number;
      value += unit.number * (killValues.get(unit.id) ?? 0);
    }
  }
  return { count, value };
};

/** Ratio as usual for K/D: without losses it is the number of kills itself */
const ratio = (kills: number, losses: number) => losses > 0 ? kills / losses : kills;

/**
 * @param killValues kill value by unit id
 * @return K/D of the player, undefined if the replay has no killed or lost units data
 */
export const calcKillDeath = (player: Player, killValues: Map<string, number>): KillDeath | undefined => {
  if (!player.unitsKilledOn || !player.unitsLostOn || !player.unitsKilledPlain || !player.unitsLostPlain) {
    return undefined;
  }
  const killed = sumUnits(player.unitsKilledPlain, killValues);
  const lost = sumUnits(player.unitsLostPlain, killValues);
  return {
    raw: ratio(killed.count, lost.count),
    value: ratio(killed.value, lost.value)
  };
};
