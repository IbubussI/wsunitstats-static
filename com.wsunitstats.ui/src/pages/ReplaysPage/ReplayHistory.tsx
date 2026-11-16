import * as React from 'react';
import dayjs from 'dayjs';
import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import {
  alpha,
  Box,
  Chip,
  IconButton,
  Stack,
  styled,
  Tooltip,
  Typography,
  type ChipProps,
  type SxProps,
  type Theme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GroupIcon from '@mui/icons-material/Group';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { MAX_ENTRIES, useReplayHistoryStore, type ReplayHistoryEntry } from '@/store/replayHistoryStore';
import { SidePanel, SidePanelEmpty, type SidePanelProps } from '@/pages/ReplaysPage/SidePanel';
import {
  downloadReplayHistory,
  readReplayHistoryFile,
  REPLAY_HISTORY_FILE_ACCEPT,
  ReplayHistoryFileError
} from '@/pages/ReplaysPage/replayHistoryFile';

/** Layout props of the side panels of the replay page */
export type SidePanelLayoutProps = Pick<SidePanelProps, 'embedded' | 'collapsible' | 'sx' | 'listSx'>;

interface ReplayHistoryProps extends SidePanelLayoutProps {
  currentReplayCode?: string;
  onOpen: (replayCode: string) => void;
}

/** Match type localization key → chip color; other types use the neutral one */
const MODE_COLORS: Record<string, ChipProps['color']> = {
  replayMatchTypeRank1: 'warning',
  replayMatchTypeRank2: 'warning',
  replayMatchTypeTeamMatch: 'info',
  replayMatchTypeFFA: 'success',
  replayMatchTypeArmageddon: 'error',
  replayMatchTypeSurvival: 'secondary'
};

interface DayGroup {
  /** Match day, absent for the replays without match details */
  day?: string;
  entries: ReplayHistoryEntry[];
}

/** Bordered icon button of the toolbar, the same look as the filter buttons of the events panel */
const ToolbarButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.action.active,
  '& svg': { fontSize: '1rem' }
}));

/** Result of the last toolbar action: a message key with its values */
interface Status {
  isError: boolean;
  text: string;
  values?: Record<string, unknown>;
}

/** Log of the replays loaded before (stored in the browser), in match start order like the in-game replay list */
export const ReplayHistory = ({ currentReplayCode, onOpen, ...layoutProps }: ReplayHistoryProps) => {
  const { t } = useTranslation();
  const entries = useReplayHistoryStore(state => state.entries);
  const isDirty = useReplayHistoryStore(state => state.isDirty);
  const removeReplay = useReplayHistoryStore(state => state.removeReplay);
  const replaceReplays = useReplayHistoryStore(state => state.replaceReplays);
  const save = useReplayHistoryStore(state => state.save);
  const listRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [status, setStatus] = React.useState<Status | null>(null);

  // entries in match start order, split by the match day; the ones without details first
  const groups = React.useMemo(() => {
    const result: DayGroup[] = [];
    const sorted = [...entries].sort((a, b) => (b.startTime ?? -Infinity) - (a.startTime ?? -Infinity));
    for (const entry of sorted) {
      const day = entry.startTime != null ? dayjs.unix(entry.startTime).format('DD/MM/YYYY') : undefined;
      const last = result[result.length - 1];
      if (last && last.day === day) {
        last.entries.push(entry);
      } else {
        result.push({ day, entries: [entry] });
      }
    }
    return result;
  }, [entries]);

  const load = async (file: File) => {
    try {
      const loaded = await readReplayHistoryFile(file);
      replaceReplays(loaded);
      setStatus({ isError: false, text: 'replayHistoryLoaded', values: { count: Math.min(loaded.length, MAX_ENTRIES) } });
    } catch (error) {
      setStatus({ isError: true, text: error instanceof ReplayHistoryFileError ? error.message : 'replayHistoryLoadErrorContent' });
    }
  };

  const toolbar = (
    <Stack gap={0.5}>
      <Stack direction='row' gap={0.5}>
        <Tooltip title={t('replayHistoryDownload')}>
          {/* a disabled button gets no mouse events, the wrapper keeps the tooltip */}
          <span>
            <ToolbarButton
              size='small'
              aria-label={t('replayHistoryDownload')}
              disabled={entries.length === 0}
              onClick={() => downloadReplayHistory(entries)}>
              <FileDownloadIcon />
            </ToolbarButton>
          </span>
        </Tooltip>
        <Tooltip title={t('replayHistoryLoad')}>
          <ToolbarButton size='small' aria-label={t('replayHistoryLoad')} onClick={() => fileInputRef.current?.click()}>
            <FileUploadIcon />
          </ToolbarButton>
        </Tooltip>
        <input
          ref={fileInputRef}
          type='file'
          accept={REPLAY_HISTORY_FILE_ACCEPT}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            // the same file can be chosen again
            event.target.value = '';
            if (file) {
              load(file);
            }
          }} />
        <Tooltip title={t(isDirty ? 'replayHistorySave' : 'replayHistorySaved')}>
          <span>
            <ToolbarButton
              size='small'
              aria-label={t('replayHistorySave')}
              disabled={!isDirty}
              onClick={() => {
                save();
                setStatus(null);
              }}
              sx={isDirty ? { color: 'primary.main', borderColor: 'primary.main' } : undefined}>
              <SaveIcon />
            </ToolbarButton>
          </span>
        </Tooltip>
      </Stack>
      {(status || isDirty) &&
        <Typography variant='caption' sx={{ color: status?.isError ? 'error.main' : 'text.secondary' }}>
          {status ? t(status.text, status.values) : t('replayHistoryUnsaved')}
          {status && !status.isError && isDirty && ' ' + t('replayHistoryUnsaved')}
        </Typography>}
    </Stack>
  );

  // newest matches are at the bottom, as in a log
  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [entries.length]);

  return (
    <SidePanel
      icon={<HistoryIcon />}
      title={t('replayHistoryTitle')}
      count={entries.length}
      storageKey={Constants.LOCAL_REPLAY_HISTORY_OPEN}
      listRef={listRef}
      toolbar={toolbar}
      {...layoutProps}>
      {groups.length === 0
        ? <SidePanelEmpty icon={<HistoryIcon />} text={t('replayHistoryEmpty')} />
        : groups.map(group => (
          <Box key={group.day ?? ''}>
            <DayHeader day={group.day ?? t('replayHistoryUnknownDate')} />
            <Stack gap={0.5}>
              {group.entries.map(entry => (
                <HistoryEntry
                  key={entry.replayCode}
                  entry={entry}
                  isCurrent={entry.replayCode === currentReplayCode}
                  onOpen={onOpen}
                  onRemove={removeReplay} />
              ))}
            </Stack>
          </Box>
        ))}
    </SidePanel>
  );
};

/** Date with lines on both sides */
const DayHeader =({ day }: { day: string }) => (
  <Stack direction='row' alignItems='center' gap={1} sx={{
    py: 0.75,
    color: 'text.secondary',
    '&::before, &::after': { content: '""', flex: 1, borderTop: 1, borderColor: 'divider' }
  }}>
    <Typography variant='caption' sx={{ letterSpacing: '0.05em' }}>
      {day}
    </Typography>
  </Stack>
);

interface HistoryEntryProps {
  entry: ReplayHistoryEntry;
  isCurrent: boolean;
  onOpen: (replayCode: string) => void;
  onRemove: (replayCode: string) => void;
}

const HistoryEntry = ({ entry, isCurrent, onOpen, onRemove }: HistoryEntryProps) => {
  const { t } = useTranslation();
  // replays loaded from a list of codes have no details until opened
  const hasDetails = entry.startTime != null && entry.mode != null && entry.playersCount != null && entry.duration != null;
  const start = dayjs.unix(entry.startTime ?? 0);
  const players = t('replayHistoryPlayers', { count: entry.playersCount ?? 0 });
  const duration = Utils.formatDuration(entry.duration ?? 0);
  const mode = entry.mode ?? '';

  return (
    <Box
      role='button'
      tabIndex={0}
      onClick={() => onOpen(entry.replayCode)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(entry.replayCode);
        }
      }}
      title={hasDetails
        ? [
          'rep-' + entry.replayCode,
          start.format('YYYY-MM-DD HH:mm:ss'),
          t(mode),
          players,
          `(${duration})`
        ].join(', ')
        : 'rep-' + entry.replayCode}
      sx={(theme) => ({
        position: 'relative',
        py: 0.75,
        pl: 1.5,
        pr: 0.5,
        borderRadius: 1,
        cursor: 'pointer',
        border: 1,
        borderColor: isCurrent ? alpha(theme.palette.primary.main, 0.5) : 'divider',
        backgroundColor: isCurrent ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
        transition: theme.transitions.create(['background-color', 'border-color']),
        // accent bar on the left
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 6,
          bottom: 6,
          width: 3,
          borderRadius: '0 3px 3px 0',
          backgroundColor: isCurrent ? 'primary.main' : 'transparent',
          transition: theme.transitions.create('background-color')
        },
        '&:hover': {
          backgroundColor: isCurrent ? alpha(theme.palette.primary.main, 0.18) : 'action.hover',
          borderColor: alpha(theme.palette.primary.main, 0.5)
        },
        '&:hover::before': { backgroundColor: 'primary.main' },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
        '&:hover .replay-history-remove, &:focus-within .replay-history-remove': { opacity: 1 }
      })}>
      <Stack direction='row' alignItems='center' gap={0.5}>
        <Typography sx={{
          flex: '1 1 auto',
          minWidth: 0,
          fontFamily: 'Consolas, "Roboto Mono", monospace',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: isCurrent ? 'primary.main' : 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <Box component='span' sx={{ color: 'text.secondary', fontWeight: 400 }}>rep-</Box>
          {entry.replayCode}
        </Typography>
        <IconButton
          className='replay-history-remove'
          size='small'
          aria-label={t('replayHistoryRemove')}
          title={t('replayHistoryRemove')}
          sx={{ opacity: 0, p: 0.25, transition: 'opacity 150ms' }}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(entry.replayCode);
          }}>
          <CloseIcon sx={{ fontSize: '0.9rem' }} />
        </IconButton>
      </Stack>
      {/* wraps only between the two groups: time + mode and players + duration stay together;
          a group wider than the panel shortens the mode chip with an ellipsis */}
      {hasDetails &&
        <Stack direction='row' alignItems='center' flexWrap='wrap' columnGap={1.25} rowGap={0.5} sx={{ mt: 0.5 }}>
          <MetaGroup>
            <Meta icon={<ScheduleIcon />} text={start.format('HH:mm')} />
            <Chip
              label={t(mode)}
              title={t(mode)}
              size='small'
              variant='outlined'
              color={MODE_COLORS[mode] ?? 'default'}
              sx={{ flex: '0 1 auto', minWidth: 0, height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }} />
          </MetaGroup>
          <MetaGroup>
            <Meta icon={<GroupIcon />} text={String(entry.playersCount)} title={players} />
            <Meta icon={<HourglassBottomIcon />} text={duration} />
          </MetaGroup>
        </Stack>}
    </Box>
  );
};

/** Items that are never split between lines */
const MetaGroup = ({ children }: { children: React.ReactNode }) => (
  <Stack direction='row' alignItems='center' columnGap={1.25} sx={{ flexWrap: 'nowrap', minWidth: 0 }}>
    {children}
  </Stack>
);

const Meta = ({ icon, text, title }: { icon: React.ReactElement<{ sx?: SxProps<Theme> }>; text: string; title?: string }) => (
  <Stack direction='row' alignItems='center' gap={0.25} title={title}
    sx={{ flexShrink: 0, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap', '& svg': { fontSize: '0.9rem' } }}>
    {icon}
    <span>{text}</span>
  </Stack>
);
