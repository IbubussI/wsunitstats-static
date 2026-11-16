import { create } from 'zustand';
import * as Constants from '@/utils/constants';
import type { Match } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';

/** Oldest entries are dropped above this number */
export const MAX_ENTRIES = 300;

/**
 * A replay the user loaded on the replay page, with the match details shown in the history log. The details are
 * absent for replays loaded from a list of codes until the replay is opened
 */
export interface ReplayHistoryEntry {
  /** Without the "rep-" prefix */
  replayCode: string;
  /** Match start, unix seconds */
  startTime?: number;
  /** Match type localization key */
  mode?: string;
  playersCount?: number;
  /** Milliseconds */
  duration?: number;
  /** When the replay was last loaded, unix milliseconds; 0 if unknown */
  viewedAt: number;
}

interface ReplayHistoryState {
  /** Shown entries: the stored ones with the unsaved changes */
  entries: ReplayHistoryEntry[];
  /** Entries in the browser storage */
  storedEntries: ReplayHistoryEntry[];
  /** The shown entries differ from the stored ones: some were removed or another list was loaded */
  isDirty: boolean;
  /** Adds an opened replay, stored at once (unsaved changes stay unsaved) */
  addReplay: (match: Match) => void;
  /** Removes a replay from the shown entries, until saved */
  removeReplay: (replayCode: string) => void;
  /** Replaces the shown entries, until saved */
  replaceReplays: (entries: ReplayHistoryEntry[]) => void;
  /** Stores the shown entries */
  save: () => void;
}

const optionalNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;

/** Entry of a replay code and a stored or loaded object; details of other types are dropped */
export const toEntry = (value: unknown, replayCode: string): ReplayHistoryEntry => {
  const object = (value ?? {}) as Record<string, unknown>;
  return {
    replayCode,
    startTime: optionalNumber(object.startTime),
    mode: typeof object.mode === 'string' ? object.mode : undefined,
    playersCount: optionalNumber(object.playersCount),
    duration: optionalNumber(object.duration),
    viewedAt: optionalNumber(object.viewedAt) ?? 0
  };
};

/** Keeps the most recently viewed entries within the limit, in the viewed order */
const limit = (entries: ReplayHistoryEntry[]) =>
  [...entries].sort((a, b) => a.viewedAt - b.viewedAt).slice(-MAX_ENTRIES);

const readEntries = (): ReplayHistoryEntry[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(Constants.LOCAL_REPLAY_HISTORY) || '[]');
    return Array.isArray(stored)
      ? stored.filter(entry => typeof entry?.replayCode === 'string').map(entry => toEntry(entry, entry.replayCode))
      : [];
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

const withReplay = (entries: ReplayHistoryEntry[], entry: ReplayHistoryEntry) =>
  limit([...entries.filter(e => e.replayCode !== entry.replayCode), entry]);

const initialEntries = readEntries();

export const useReplayHistoryStore = create<ReplayHistoryState>()((set) => ({
  entries: initialEntries,
  storedEntries: initialEntries,
  isDirty: false,
  addReplay: (match) => set(state => {
    const entry: ReplayHistoryEntry = {
      replayCode: match.replayCode,
      startTime: match.startTime,
      mode: match.mode,
      playersCount: match.playersCount,
      duration: match.duration,
      viewedAt: Date.now()
    };
    const storedEntries = withReplay(state.storedEntries, entry);
    writeEntries(storedEntries);
    return state.isDirty
      ? { storedEntries, entries: withReplay(state.entries, entry) }
      : { storedEntries, entries: storedEntries };
  }),
  removeReplay: (replayCode) => set(state => ({
    entries: state.entries.filter(e => e.replayCode !== replayCode),
    isDirty: true
  })),
  replaceReplays: (entries) => set(() => ({ entries: limit(entries), isDirty: true })),
  save: () => set(state => {
    writeEntries(state.entries);
    return { storedEntries: state.entries, isDirty: false };
  })
}));
