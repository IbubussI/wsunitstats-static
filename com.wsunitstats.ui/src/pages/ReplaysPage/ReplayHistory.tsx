import * as React from 'react';
import dayjs from 'dayjs';
import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import {
  alpha,
  Box,
  ButtonBase,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
  type ChipProps,
  type SxProps,
  type Theme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GroupIcon from '@mui/icons-material/Group';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { useTranslation } from 'react-i18next';
import { useReplayHistoryStore, type ReplayHistoryEntry } from '@/store/replayHistoryStore';

interface ReplayHistoryProps {
  currentReplayCode?: string;
  onOpen: (replayCode: string) => void;
  /** Shown inside another container: no own background and padding */
  embedded?: boolean;
  /** The header collapses the list; the state is stored in the browser, open by default */
  collapsible?: boolean;
  sx?: SxProps<Theme>;
  /** Size of the scrolled list */
  listSx?: SxProps<Theme>;
}

const readStoredOpen = () => {
  try {
    return localStorage.getItem(Constants.LOCAL_REPLAY_HISTORY_OPEN) !== 'false';
  } catch {
    return true;
  }
};

const storeOpen = (isOpen: boolean) => {
  try {
    localStorage.setItem(Constants.LOCAL_REPLAY_HISTORY_OPEN, String(isOpen));
  } catch {
    // storage is blocked: the state is kept until the page is reloaded
  }
};

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
  day: string;
  entries: ReplayHistoryEntry[];
}

/** Log of the replays loaded before (stored in the browser), in match start order like the in-game replay list */
export const ReplayHistory = ({ currentReplayCode, onOpen, embedded = false, collapsible = false, sx, listSx }: ReplayHistoryProps) => {
  const { t } = useTranslation();
  const entries = useReplayHistoryStore(state => state.entries);
  const removeReplay = useReplayHistoryStore(state => state.removeReplay);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [isStoredOpen, setStoredOpen] = React.useState(readStoredOpen);
  const isOpen = !collapsible || isStoredOpen;
  const toggle = () => {
    storeOpen(!isStoredOpen);
    setStoredOpen(!isStoredOpen);
  };

  // entries in match start order, split by the match day
  const groups = React.useMemo(() => {
    const result: DayGroup[] = [];
    for (const entry of [...entries].sort((a, b) => a.startTime - b.startTime)) {
      const day = dayjs.unix(entry.startTime).format('DD/MM/YYYY');
      const last = result[result.length - 1];
      if (last?.day === day) {
        last.entries.push(entry);
      } else {
        result.push({ day, entries: [entry] });
      }
    }
    return result;
  }, [entries]);

  // newest matches are at the bottom, as in a log
  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [entries.length]);

  return (
    <Paper
      elevation={embedded ? 0 : undefined}
      sx={[
        { p: embedded ? 0 : 1.5, display: 'flex', flexDirection: 'column' },
        embedded && { backgroundColor: 'transparent', backgroundImage: 'none' },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}>
      <Stack direction='row' alignItems='center' justifyContent='center' gap={1}
        {...(collapsible && {
          component: ButtonBase,
          onClick: toggle,
          'aria-expanded': isOpen,
          title: t(isOpen ? 'replayHistoryCollapse' : 'replayHistoryExpand')
        })}
        sx={{
          position: 'relative',
          width: '100%',
          py: 0.5,
          borderRadius: 1,
          '&:hover': collapsible ? { backgroundColor: 'action.hover' } : undefined
        }}>
        <HistoryIcon fontSize='small' color='primary' />
        <Typography variant='subtitle2'>
          {t('replayHistoryTitle')}
        </Typography>
        {entries.length > 0 &&
          <Chip label={entries.length} size='small' sx={{ height: 18, fontSize: '0.7rem' }} />}
        {collapsible &&
          <ExpandMoreIcon fontSize='small' sx={(theme) => ({
            position: 'absolute',
            right: 4,
            color: 'text.secondary',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: theme.transitions.create('transform')
          })} />}
      </Stack>
      <Collapse in={isOpen}>
        <Box ref={listRef} sx={[
          { overflowY: 'auto', pr: 0.5, mt: 0.5, pt: 0.5, borderTop: 1, borderColor: 'divider' },
          ...(Array.isArray(listSx) ? listSx : [listSx])
        ]}>
          {groups.length === 0
            ? <Stack alignItems='center' gap={1} sx={{ py: 4, color: 'text.secondary' }}>
              <HistoryIcon sx={{ fontSize: 40, opacity: 0.4 }} />
              <Typography variant='body2' sx={{ textAlign: 'center' }}>
                {t('replayHistoryEmpty')}
              </Typography>
            </Stack>
            : groups.map(group => (
              <Box key={group.day}>
                <DayHeader day={group.day} />
                <Stack gap={0.5}>
                  {group.entries.map(entry => (
                    <HistoryEntry
                      key={entry.replayCode}
                      entry={entry}
                      isCurrent={entry.replayCode === currentReplayCode}                    onOpen={onOpen}
                      onRemove={removeReplay} />
                  ))}
                </Stack>
              </Box>
            ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

/** Date with lines on both sides */
const DayHeader = ({ day }: { day: string }) => (
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
  const start = dayjs.unix(entry.startTime);
  const players = t('replayHistoryPlayers', { count: entry.playersCount });
  const duration = Utils.formatDuration(entry.duration);

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
      title={[
        'rep-' + entry.replayCode,
        start.format('YYYY-MM-DD HH:mm:ss'),
        t(entry.mode),
        players,
        `(${duration})`
      ].join(', ')}
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
      <Stack direction='row' alignItems='center' flexWrap='wrap' columnGap={1.25} rowGap={0.5} sx={{ mt: 0.5 }}>
        <MetaGroup>
          <Meta icon={<ScheduleIcon />} text={start.format('HH:mm')} />
          <Chip
            label={t(entry.mode)}
            title={t(entry.mode)}
            size='small'
            variant='outlined'
            color={MODE_COLORS[entry.mode] ?? 'default'}
            sx={{ flex: '0 1 auto', minWidth: 0, height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }} />
        </MetaGroup>
        <MetaGroup>
          <Meta icon={<GroupIcon />} text={String(entry.playersCount)} title={players} />
          <Meta icon={<HourglassBottomIcon />} text={duration} />
        </MetaGroup>
      </Stack>
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
