// Used when ws-replay-analyzer is not installed; the types cover only the fields used by replayAnalyzer.ts

interface StubReplayInfo {
  chat: { time: number; playerId: number; message: string; destination: string }[];
  disconnect: { time: number; playerId: number; type: string }[];
  resShare: {
    time: number;
    senderId: number;
    receiverId: number;
    resources: { food: number; wood: number; r2: number; r3: number; r4: number };
    deliveryTax: number;
  }[];
}

export async function generateReplayInfo(_code: string): Promise<StubReplayInfo | null> {
  return null;
}
