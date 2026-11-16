import dayjs from 'dayjs';
import { toEntry, type ReplayHistoryEntry } from '@/store/replayHistoryStore';

const REPLAY_CODE_PREFIX = 'rep-';
/** Replay code, with or without the prefix */
const REPLAY_CODE = /^(?:rep-)?([A-Za-z0-9_-]{11})$/;
export const REPLAY_HISTORY_FILE_ACCEPT = '.json,application/json';

/** Load failure: the localization key of the message */
export class ReplayHistoryFileError extends Error {}

const parseCode = (value: unknown) => typeof value === 'string' ? value.trim().match(REPLAY_CODE)?.[1] : undefined;

/** Downloads the entries with the match details as wsunitstats-replay-history-DD-MM-YYYY.json; codes with the "rep-" prefix */
export const downloadReplayHistory = (entries: ReplayHistoryEntry[]) => {
  const content = JSON.stringify(entries.map(entry => ({ ...entry, replayCode: REPLAY_CODE_PREFIX + entry.replayCode })), null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `wsunitstats-replay-history-${dayjs().format('DD-MM-YYYY')}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const invalidContent = () => new ReplayHistoryFileError('replayHistoryLoadErrorContent');

/**
 * Entries of a list file: a JSON array of entries with a replay code (as downloaded) or of replay codes.
 * Repeated codes are kept once, the last one
 * @throws ReplayHistoryFileError if the file is not JSON or is not a non-empty list of valid replay codes
 */
export const readReplayHistoryFile = async (file: File): Promise<ReplayHistoryEntry[]> => {
  if (file.name.split('.').pop()?.toLowerCase() !== 'json') {
    throw new ReplayHistoryFileError('replayHistoryLoadErrorType');
  }
  let items: unknown;
  try {
    items = JSON.parse(await file.text());
  } catch {
    throw invalidContent();
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw invalidContent();
  }
  const entries = items.map(item => {
    const code = parseCode(typeof item === 'string' ? item : (item as { replayCode?: unknown } | null)?.replayCode);
    if (!code) {
      throw invalidContent();
    }
    return toEntry(typeof item === 'string' ? undefined : item, code);
  });
  return [...new Map(entries.map(entry => [entry.replayCode, entry])).values()];
};
