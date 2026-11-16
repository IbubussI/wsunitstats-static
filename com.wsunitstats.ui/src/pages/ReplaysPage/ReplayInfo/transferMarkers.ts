import * as React from 'react';
import * as Utils from '@/utils/utils';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '@/store/gameDataStore';
import type { ReplayParseResult } from './replayStructure';
import type { ReplayExtraData } from './replayAnalyzer';

/** Mark on a chart line at a point of time, described in the tooltip */
export interface ChartMarker {
  /** same for the marks of one event on several lines, the tooltip lists it once */
  id: string;
  /** position on the time line, in time line periods */
  x: number;
  kind: 'in' | 'out';
  text: string;
}

/** Marks of a line of the chart: of a dataset or of a row of a multi-row dataset */
export type ChartMarkerProvider = (containerName: string, dataset: { playerId?: number }, row?: number) => ChartMarker[];

/** Stockpile charts → resource of the line (multi-row: the row is the resource) */
const STOCKPILE_RESOURCES: Record<string, number | 'row'> = {
  replayDatasetResourcesNowName: 'row',
  replayDatasetFoodNowName: 0,
  replayDatasetWoodNowName: 1,
  replayDatasetIronNowName: 2
};

/**
 * Resource transfers on the stockpile lines of single players: the sent amounts on the sender line,
 * the received ones (without the delivery tax) on the receiver line
 */
export const useTransferMarkers = (replayInfo: ReplayParseResult, extraData: ReplayExtraData | null) => {
  const { t, i18n } = useTranslation();
  const resources = useGameContext().resources;

  return React.useMemo<ChartMarkerProvider | undefined>(() => {
    if (!extraData || extraData.resourceTransfers.length === 0) {
      return undefined;
    }
    const periodSec = replayInfo.timeLinePeriod / 1000;
    const formatAmounts = (amounts: number[]) => amounts
      .map((amount, resourceId) => {
        const resource = resources?.find(resource => resource.gameId === resourceId);
        return amount > 0 ? `${Math.round(amount).toLocaleString(i18n.language)} ${resource ? t(resource.name) : '#' + resourceId}` : null;
      })
      .filter(Boolean)
      .join(', ');
    const nickname = (playerId: number) => replayInfo.players[playerId]?.nickname ?? '?';

    return (containerName, dataset, row) => {
      const resource = STOCKPILE_RESOURCES[containerName];
      const resourceId = resource === 'row' ? row : resource;
      if (resourceId == null || dataset.playerId == null) {
        return [];
      }
      const markers: ChartMarker[] = [];
      extraData.resourceTransfers.forEach((transfer, index) => {
        if (!(transfer.amounts[resourceId] > 0)) {
          return;
        }
        const time = Utils.formatDuration(transfer.time * 1000);
        if (transfer.senderId === dataset.playerId) {
          markers.push({
            id: `${index}-out`,
            x: transfer.time / periodSec,
            kind: 'out',
            text: `${time} ${t('replayTransferMarkerSent', {
              name: nickname(transfer.receiverId),
              amounts: formatAmounts(transfer.amounts)
            })}`
          });
        }
        if (transfer.receiverId === dataset.playerId) {
          markers.push({
            id: `${index}-in`,
            x: transfer.time / periodSec,
            kind: 'in',
            text: `${time} ${t('replayTransferMarkerReceived', {
              name: nickname(transfer.senderId),
              amounts: formatAmounts(transfer.amounts.map(amount => amount * transfer.receivedPercent / 100))
            })}`
          });
        }
      });
      return markers;
    };
  }, [replayInfo, extraData, resources, t, i18n.language]);
};
