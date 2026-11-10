import { create } from 'zustand';
import * as Constants from '@/utils/constants';
import type { Match } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

/** Oldest entries are dropped above this number */
const MAX_ENTRIES = 300;

/** A replay the user loaded on the replay page, with the match details shown in the history log */
export interface ReplayHistoryEntry {
  replayCode: string;
  /** Match start, unix seconds */
  startTime: number;
  /** Match type localization key */
  mode: string;
  playersCount: number;
  /** Milliseconds */
  duration: number;
  /** When the replay was last loaded, unix milliseconds */
  viewedAt: number;
}

interface ReplayHistoryState {
  entries: ReplayHistoryEntry[];
  addReplay: (match: Match) => void;
  removeReplay: (replayCode: string) => void;
}

const readEntries = (): ReplayHistoryEntry[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(Constants.LOCAL_REPLAY_HISTORY) || '[]');
    return Array.isArray(stored) ? stored.filter(entry => typeof entry?.replayCode === 'string') : [];
  } catch {
    return [];
  }
};

const writeEntries = (entries: ReplayHistoryEntry[]) => {
  try {
    localStorage.setItem(Constants.LOCAL_REPLAY_HISTORY, JSON.stringify(entries));
  } catch {
    // storage is full or blocked: the history lives for this page session only
  }
};

const update = (entries: ReplayHistoryEntry[]) => {
  writeEntries(entries);
  return { entries };
};

export const useReplayHistoryStore = create<ReplayHistoryState>()((set) => ({
  entries: readEntries(),
  addReplay: (match) => set(state => {
    const entry: ReplayHistoryEntry = {
      replayCode: match.replayCode,
      startTime: match.startTime,
      mode: match.mode,
      playersCount: match.playersCount,
      duration: match.duration,
      viewedAt: Date.now()
    };
    const entries = [...state.entries.filter(e => e.replayCode !== entry.replayCode), entry];
    // keep the most recently viewed ones
    entries.sort((a, b) => a.viewedAt - b.viewedAt);
    return update(entries.slice(-MAX_ENTRIES));
  }),
  removeReplay: (replayCode) => set(state => update(state.entries.filter(e => e.replayCode !== replayCode)))
}));
