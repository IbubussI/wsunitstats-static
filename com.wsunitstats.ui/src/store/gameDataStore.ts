import { create } from 'zustand';
import type { GameContext } from '@/types/game';

interface GameDataState {
  context: GameContext | null;
  setContext: (context: GameContext) => void;
}

/** Common game data (context.json), loaded once by the root route */
export const useGameDataStore = create<GameDataState>()((set) => ({
  context: null,
  setContext: (context) => set({ context })
}));

/** Returns the loaded game context. Must be used only below the root route */
export const useGameContext = (): GameContext => {
  const context = useGameDataStore((state) => state.context);
  if (!context) {
    throw new Error('Game context is not loaded');
  }
  return context;
};
