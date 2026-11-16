// Used when ws-replay-analyzer is not installed; the types cover only the fields used by replayAnalyzer.ts

interface StubReplayInfo {
  chat: { time: number; playerId: number; message: string; destination: string }[];
  connectInfo: { time: number; playerId: number; type: 'connect' | 'disconnect' | 'leave' }[];
  resShare: {
    time: number;
    senderId: number;
    receiverId: number;
    resources: number[];
    deliveryTax: number;
  }[];
  activity: { playerId: number; step: number; data: number[] }[];
}

export async function generateReplayInfo(_code: string): Promise<StubReplayInfo | null> {
  return null;
}
