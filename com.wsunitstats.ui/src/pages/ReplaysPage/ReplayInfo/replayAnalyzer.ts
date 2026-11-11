// Load additional replay data

/** Times are seconds since the match start (`Match.startTime`) */
export interface ReplayChatMessage {
  time: number;
  /** Player index, the same as `Player.id` */
  playerId: number;
  text: string;
  isTeamOnly: boolean;
}

export interface ReplayPlayerLeave {
  time: number;
  playerId: number;
  /** The connection was lost instead of leaving the game */
  isDisconnect: boolean;
}

export interface ReplayResourceTransfer {
  time: number;
  senderId: number;
  receiverId: number;
  /** Sent amounts by resource index (0 food, 1 wood, ...) */
  amounts: number[];
  /** Percent of the sent amounts the receiver gets */
  receivedPercent: number;
}

export interface ReplayExtraData {
  chat: ReplayChatMessage[];
  leaves: ReplayPlayerLeave[];
  resourceTransfers: ReplayResourceTransfer[];
}

/** Resolves to null when the data is not available, for any reason */
export async function loadReplayExtraData(replayCode: string): Promise<ReplayExtraData | null> {
  try {
    const { generateReplayInfo } = await import('ws-replay-analyzer');
    const info = await generateReplayInfo(replayCode);
    if (!info) {
      return null;
    }
    return {
      chat: info.chat.map(entry => ({
        time: entry.time,
        playerId: entry.playerId,
        text: entry.message,
        isTeamOnly: entry.destination === 'team'
      })),
      leaves: info.disconnect.map(entry => ({
        time: entry.time,
        playerId: entry.playerId,
        isDisconnect: entry.type === 'disconnect'
      })),
      resourceTransfers: info.resShare.map(entry => {
        const { food, wood, r2, r3, r4 } = entry.resources;
        return {
          time: entry.time,
          senderId: entry.senderId,
          receiverId: entry.receiverId,
          amounts: [food, wood, r2, r3, r4],
          receivedPercent: entry.deliveryTax
        };
      })
    };
  } catch {
    return null;
  }
}
