import { useOutletContext } from 'react-router-dom';
import type { ReplayParseResult } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import type { ReplayExtraData } from '@/pages/ReplaysPage/ReplayInfo/replayAnalyzer';

/** Data of the loaded replay for the replay info and player pages */
export interface ReplayOutletContext {
  replayInfo: ReplayParseResult;
  /** Additional replay data, null if it is not loaded (yet or at all) */
  extraData: ReplayExtraData | null;
}

export const useReplayOutletContext = () => useOutletContext<ReplayOutletContext>();
