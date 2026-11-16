// Load additional replay data

/** Times are seconds of game time: 0 is the start of the match after loading, as the times of the replay API */
export interface ReplayChatMessage {
  time: number;
  /** Player index, the same as `Player.id` */
  playerId: number;
  text: string;
  isTeamOnly: boolean;
}

/** `reconnect`: the player is back after a disconnect */
export type ReplayConnectionEventType = 'leave' | 'disconnect' | 'reconnect';

export interface ReplayConnectionEvent {
  time: number;
  playerId: number;
  type: ReplayConnectionEventType;
}

export interface ReplayResourceTransfer {
  time: number;
  senderId: number;
  receiverId: number;
  /** Sent amounts by resource id (`ResourceOption.gameId`: 0 food, 1 wood, 2 iron, ...) */
  amounts: number[];
  /** Percent of the sent amounts the receiver gets */
  receivedPercent: number;
}

/** Number of player actions (orders and commands sent to the server) in each step of game time over the match */
export interface ReplayPlayerActivity {
  playerId: number;
  /** Length of a step, seconds */
  step: number;
  actions: number[];
}

export interface ReplayExtraData {
  chat: ReplayChatMessage[];
  connections: ReplayConnectionEvent[];
  resourceTransfers: ReplayResourceTransfer[];
  activity: ReplayPlayerActivity[];
}

/** Resolves to null when the data is not available, for any reason */
export async function loadReplayExtraData(replayCode: string): Promise<ReplayExtraData | null> {
  try {
    const { generateReplayInfo } = await import('ws-replay-analyzer');
    const info = await generateReplayInfo(replayCode);
    if (!info) {
      return null;
    }
    // the first connect of each player is the join at the match start, the next ones are reconnects
    const joined = new Set<number>();
    const connections: ReplayConnectionEvent[] = [];
    for (const entry of info.connectInfo) {
      if (entry.type === 'connect') {
        if (joined.has(entry.playerId)) {
          connections.push({ time: entry.time, playerId: entry.playerId, type: 'reconnect' });
        }
        joined.add(entry.playerId);
      } else if (entry.type === 'leave' || entry.type === 'disconnect') {
        connections.push({ time: entry.time, playerId: entry.playerId, type: entry.type });
      }
    }
    return {
      chat: info.chat.map(entry => ({
        time: entry.time,
        playerId: entry.playerId,
        text: entry.message,
        isTeamOnly: entry.destination === 'team'
      })),
      connections,
      resourceTransfers: info.resShare.map(entry => ({
        time: entry.time,
        senderId: entry.senderId,
        receiverId: entry.receiverId,
        amounts: entry.resources,
        receivedPercent: entry.deliveryTax
      })),
      activity: info.activity.map(entry => ({
        playerId: entry.playerId,
        step: entry.step,
        actions: entry.data
      }))
    };
  } catch {
    return null;
  }
}
