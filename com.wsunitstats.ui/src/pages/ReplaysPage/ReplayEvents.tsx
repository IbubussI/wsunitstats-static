import * as React from 'react';
import * as Utils from '@/utils/utils';
import * as Constants from '@/utils/constants';
import { Box, Chip, Stack, ToggleButton, Tooltip, useTheme, type SxProps, type Theme } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ForumIcon from '@mui/icons-material/Forum';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useTranslation } from 'react-i18next';
import { ColorIndicator } from '@/components/common/misc';
import { useGameContext } from '@/store/gameDataStore';
import { SidePanel, SidePanelEmpty } from '@/pages/ReplaysPage/SidePanel';
import type { SidePanelLayoutProps } from '@/pages/ReplaysPage/ReplayHistory';
import type { ReplayParseResult, Team } from '@/pages/ReplaysPage/ReplayInfo/replayStructure';
import type {
  ReplayChatMessage,
  ReplayExtraData,
  ReplayPlayerLeave,
  ReplayResourceTransfer
} from '@/pages/ReplaysPage/ReplayInfo/replayAnalyzer';

interface ReplayEventsProps extends SidePanelLayoutProps {
  replayInfo: ReplayParseResult;
  extraData: ReplayExtraData;
}

/** Longer nicknames are cut with an ellipsis (the full one is in the tooltip) */
const NICKNAME_MAX_LENGTH = 25;

const formatTime = (timeSec: number) => Utils.formatDuration(Math.max(0, timeSec) * 1000);

type ReplayEvent =
  | { time: number; playerId: number; message: ReplayChatMessage }
  | { time: number; playerId: number; leave: ReplayPlayerLeave }
  | { time: number; playerId: number; transfer: ReplayResourceTransfer };

type EventKind = 'chat' | 'leave' | 'transfer';

const getEventKind = (event: ReplayEvent): EventKind =>
  'message' in event ? 'chat' : 'leave' in event ? 'leave' : 'transfer';

const EVENT_FILTERS: { kind: EventKind; label: string; icon: typeof LogoutIcon }[] = [
  { kind: 'chat', label: 'replayEventsFilterChat', icon: ForumIcon },
  { kind: 'leave', label: 'replayEventsFilterLeaves', icon: LogoutIcon },
  { kind: 'transfer', label: 'replayEventsFilterResources', icon: SwapHorizIcon }
];

const ALL_EVENT_KINDS = EVENT_FILTERS.map(filter => filter.kind);

/** Shown kinds stored in the browser; all kinds if nothing is stored yet */
const readStoredFilter = (): EventKind[] => {
  try {
    const stored = localStorage.getItem(Constants.LOCAL_REPLAY_EVENTS_FILTER);
    const kinds = stored == null ? ALL_EVENT_KINDS : JSON.parse(stored);
    return Array.isArray(kinds) ? kinds.filter(kind => ALL_EVENT_KINDS.includes(kind)) : ALL_EVENT_KINDS;
  } catch {
    return ALL_EVENT_KINDS;
  }
};

const storeFilter = (kinds: EventKind[]) => {
  try {
    localStorage.setItem(Constants.LOCAL_REPLAY_EVENTS_FILTER, JSON.stringify(kinds));
  } catch {
    // storage is blocked: the filter is kept until the page is reloaded
  }
};

/** Chat messages, player leaves and resource transfers of the match in time order */
export const ReplayEvents = ({ replayInfo, extraData, ...layoutProps }: ReplayEventsProps) => {
  const { t } = useTranslation();
  const events = React.useMemo<ReplayEvent[]>(() => [
    ...extraData.chat.map(message => ({ time: message.time, playerId: message.playerId, message })),
    ...extraData.leaves.map(leave => ({ time: leave.time, playerId: leave.playerId, leave })),
    ...extraData.resourceTransfers.map(transfer => ({ time: transfer.time, playerId: transfer.senderId, transfer }))
  ].sort((a, b) => a.time - b.time), [extraData]);

  // shown kinds, all by default
  const [filter, setFilter] = React.useState<EventKind[]>(readStoredFilter);
  const toggleFilter = (kind: EventKind) => {
    const next = filter.includes(kind) ? filter.filter(k => k !== kind) : [...filter, kind];
    storeFilter(next);
    setFilter(next);
  };
  const kindCounts = React.useMemo(() => {
    const counts: Partial<Record<EventKind, number>> = {};
    events.forEach(event => {
      const kind = getEventKind(event);
      counts[kind] = (counts[kind] ?? 0) + 1;
    });
    return counts;
  }, [events]);
  const shownEvents = React.useMemo(
    () => events.filter(event => filter.includes(getEventKind(event))),
    [events, filter]);

  return (
    <SidePanel
      icon={<EventNoteIcon />}
      title={t('replayEventsTitle')}
      count={events.length}
      storageKey={Constants.LOCAL_REPLAY_EVENTS_OPEN}
      toolbar={events.length > 0 &&
        <Stack direction='row' flexWrap='wrap' gap={0.5}>
          {EVENT_FILTERS.map(({ kind, label, icon: Icon }) => {
            const count = kindCounts[kind] ?? 0;
            const name = `${t(label)}: ${count}`;
            return (
              <Tooltip key={kind} title={name}>
                {/* a disabled button gets no mouse events, the wrapper keeps the tooltip */}
                <span>
                  <ToggleButton
                    value={kind}
                    size='small'
                    color='primary'
                    selected={filter.includes(kind)}
                    // an empty kind can still be unselected
                    disabled={count === 0 && !filter.includes(kind)}
                    onChange={() => toggleFilter(kind)}
                    aria-label={name}
                    sx={{ p: 0.5 }}>
                    <Icon sx={{ fontSize: '1rem' }} />
                  </ToggleButton>
                </span>
              </Tooltip>
            );
          })}
        </Stack>}
      {...layoutProps}>
      {events.length === 0
        ? <SidePanelEmpty icon={<EventNoteIcon />} text={t('replayEventsEmpty')} />
        : shownEvents.length === 0
          ? <SidePanelEmpty icon={<EventNoteIcon />} text={t('replayEventsFilterEmpty')} />
          : <EventList replayInfo={replayInfo} events={shownEvents} />}
    </SidePanel>
  );
};

/**
 * Events in one grid of three columns: kind, content, time. Labels and times stay in columns
 * and the content wraps in its own column
 */
const EventList = ({ replayInfo, events }: { replayInfo: ReplayParseResult; events: ReplayEvent[] }) => {
  const teamBackground = useTeamBackground(replayInfo);
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'max-content minmax(0, 1fr) max-content',
      columnGap: 0.75,
      rowGap: 0.25,
      py: 0.5,
      fontSize: '0.8rem',
      lineHeight: 1.4
    }}>
      {events.map((event, i) => (
        <EventRow key={i} background={teamBackground(event.playerId)}>
          {'message' in event
            ? <ChatMessageCells replayInfo={replayInfo} message={event.message} />
            : 'leave' in event
              ? <LeaveCells replayInfo={replayInfo} leave={event.leave} />
              : <TransferCells replayInfo={replayInfo} transfer={event.transfer} />}
          <Stack alignItems='flex-end' gap={0.5}>
            <EventTime time={event.time} />
            {'transfer' in event && <TransferTax transfer={event.transfer} />}
          </Stack>
        </EventRow>
      ))}
    </Box>
  );
};

/** Line of the event grid: takes all columns and passes them to its cells */
const EventRow = ({ background, children }: { background?: string; children: React.ReactNode }) => (
  <Box sx={{
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'subgrid',
    alignItems: 'baseline',
    px: 0.5,
    py: 0.25,
    borderRadius: 0.5,
    backgroundColor: background
  }}>
    {children}
  </Box>
);

const EventTime = ({ time }: { time: number }) => (
  <Box component='span' sx={{
    flexShrink: 0,
    color: 'text.secondary',
    fontSize: '0.7rem',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right'
  }}>
    {formatTime(time)}
  </Box>
);

const EventIcon = ({ icon: Icon, title }: { icon: typeof LogoutIcon; title?: string }) => (
  <Box component='span' title={title} sx={{ justifySelf: 'center', alignSelf: 'center', display: 'flex', color: 'text.secondary' }}>
    <Icon sx={{ fontSize: '0.9rem' }} />
  </Box>
);

const ChatMessageCells = ({ replayInfo, message }: { replayInfo: ReplayParseResult; message: ReplayChatMessage }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box component='span' title={t(message.isTeamOnly ? 'replayChatTeamTooltip' : 'replayChatAllTooltip')} sx={{
        // fills the column, so all labels take the width of the widest one
        justifySelf: 'stretch',
        textAlign: 'center',
        px: 0.5,
        border: 1,
        borderRadius: 0.5,
        borderColor: message.isTeamOnly ? 'info.main' : 'divider',
        color: message.isTeamOnly ? 'info.main' : 'text.secondary',
        fontSize: '0.65rem',
        lineHeight: 1.4
      }}>
        {t(message.isTeamOnly ? 'replayChatTeam' : 'replayChatAll')}
      </Box>
      <Box component='span' sx={{ overflowWrap: 'anywhere' }}>
        <PlayerName replayInfo={replayInfo} playerId={message.playerId} suffix=':' />
        {' '}{message.text}
      </Box>
    </>
  );
};

const LeaveCells = ({ replayInfo, leave }: { replayInfo: ReplayParseResult; leave: ReplayPlayerLeave }) => {
  const { t } = useTranslation();

  return (
    <>
      <EventIcon icon={leave.isDisconnect ? WifiOffIcon : LogoutIcon} />
      <Box component='span' sx={{ color: 'text.secondary', fontStyle: 'italic', overflowWrap: 'anywhere' }}>
        {t(leave.isDisconnect ? 'replayChatDisconnect' : 'replayChatLeave', {
          name: shortenNickname(getPlayerName(replayInfo, leave.playerId))
        })}
      </Box>
    </>
  );
};

const TransferCells = ({ replayInfo, transfer }: { replayInfo: ReplayParseResult; transfer: ReplayResourceTransfer }) => {
  const { t } = useTranslation();

  return (
    <>
      <EventIcon icon={SwapHorizIcon} title={t('replayResourcesTitle')} />
      <Box sx={{ minWidth: 0 }}>
        <TransferParties replayInfo={replayInfo} transfer={transfer} />
        <TransferAmounts transfer={transfer} sx={{ mt: 0.5 }} />
      </Box>
    </>
  );
};

/** Sender → receiver in one line: names that do not fit are cut with an ellipsis */
const TransferParties = ({ replayInfo, transfer }: { replayInfo: ReplayParseResult; transfer: ReplayResourceTransfer }) => (
  <Stack direction='row' alignItems='center' sx={{ minWidth: 0 }}>
    <PlayerName replayInfo={replayInfo} playerId={transfer.senderId} fit />
    <ArrowForwardIcon sx={{ flexShrink: 0, mx: 0.5, fontSize: '0.85rem', color: 'text.secondary' }} />
    <PlayerName replayInfo={replayInfo} playerId={transfer.receiverId} fit />
  </Stack>
);

/** Sent amounts */
const TransferAmounts = ({ transfer, sx }: { transfer: ReplayResourceTransfer; sx?: SxProps<Theme> }) => (
  <Stack direction='row' alignItems='center' flexWrap='wrap' columnGap={1.25} rowGap={0.25} sx={sx}>
    {transfer.amounts.map((amount, resourceId) => amount > 0 &&
      <ResourceAmount key={resourceId} resourceId={resourceId} amount={amount} />)}
  </Stack>
);

/** Part of the sent amounts lost on delivery, as the game shows it */
const TransferTax = ({ transfer }: { transfer: ReplayResourceTransfer }) => {
  const { t } = useTranslation();
  const tax = 100 - transfer.receivedPercent;

  return (
    <Chip
      label={`${tax}%`}
      title={t('replayResourcesTax', { tax, received: transfer.receivedPercent })}
      size='small'
      variant='outlined'
      sx={{ flexShrink: 0, height: 18, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }} />
  );
};

const ResourceAmount = ({ resourceId, amount }: { resourceId: number; amount: number }) => {
  const { t } = useTranslation();
  const resource = useGameContext().resources?.find(resource => resource.gameId === resourceId);

  return (
    <Stack direction='row' alignItems='center' gap={0.25} title={resource && t(resource.name)}>
      {resource?.image
        ? <img src={Utils.resolveImage(resource.image)} alt='' width={16} height={16} />
        : <Box component='span' sx={{ color: 'text.secondary' }}>{resource ? t(resource.name) : `#${resourceId}`}</Box>}
      <span>{Math.round(amount)}</span>
    </Stack>
  );
};

/**
 * Background of the entries of a player: the team color of the player table.
 * Only in matches of up to two teams, where the team colors tell the teams apart
 */
const useTeamBackground = (replayInfo: ReplayParseResult) => {
  const isDark = useTheme().palette.mode === 'dark';
  return React.useMemo(() => {
    const teams: Team[] = replayInfo.teams ?? [];
    const isColored = teams.filter(team => team.isPlayerTeam).length <= 2;
    return (playerId: number): string | undefined => {
      const color = isColored ? teams[replayInfo.players?.[playerId]?.team]?.color : undefined;
      return color && (isDark ? color.dark : color.light);
    };
  }, [replayInfo, isDark]);
};

const getPlayerName = (replayInfo: ReplayParseResult, playerId: number): string =>
  replayInfo.players?.[playerId]?.nickname ?? '?';

/** Cuts by characters (code points), so emoji and other non-BMP characters are not split */
const shortenNickname = (name: string) => {
  const chars = Array.from(name);
  return chars.length > NICKNAME_MAX_LENGTH ? chars.slice(0, NICKNAME_MAX_LENGTH - 1).join('') + '…' : name;
};

/** Bold, but narrower than the text around it, as names are frequent and long */
const PLAYER_NAME_SX: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: '0.95em',
  letterSpacing: '-0.02em',
  fontStretch: 'semi-condensed'
};

/**
 * Color square and name (with the suffix, e.g. a colon), never split between lines. In the text flow by default;
 * `fit` makes it a flex item of a row that shrinks the name with an ellipsis
 */
const PlayerName = ({ replayInfo, playerId, fit = false, suffix }: {
  replayInfo: ReplayParseResult;
  playerId: number;
  fit?: boolean;
  suffix?: string;
}) => {
  const name = getPlayerName(replayInfo, playerId);
  return (
    <Box component='span' title={name} sx={[
      { whiteSpace: 'nowrap' },
      fit && { display: 'flex', alignItems: 'center', minWidth: 0 }
    ]}>
      <ColorIndicator component='span' color={replayInfo.players?.[playerId]?.color ?? 'transparent'}
        sx={{ display: 'inline-block', flexShrink: 0, width: 8, height: 8, mr: 0.5 }} />
      <Box component='span' sx={[PLAYER_NAME_SX, fit && { overflow: 'hidden', textOverflow: 'ellipsis' }]}>
        {shortenNickname(name)}
      </Box>
      {suffix}
    </Box>
  );
};
