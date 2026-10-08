import * as Constants from '@/utils/constants';

let legacyUnitIds: Promise<Record<string, string>> | undefined;

/**
 * Loads (once) the mapping of legacy numeric unit ids to path ids (units of legacyIds.json from the game files).
 * Replays recorded before the game switched to path ids reference units by these numeric ids
 */
export const loadLegacyUnitIds = () => {
  legacyUnitIds ??= fetch(Constants.LEGACY_IDS_PATH)
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('Cannot load legacy unit ids')))
    .then((legacyIds: { units: Record<string, string> }) => legacyIds.units)
    .catch((error) => {
      // allow to retry on the next replay
      legacyUnitIds = undefined;
      throw error;
    });
  return legacyUnitIds;
};
