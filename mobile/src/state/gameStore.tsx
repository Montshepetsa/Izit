import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { createInitialGameState, gameReducer } from './gameReducer';
import type { GameAction, GameState } from './gameTypes';

type GameStore = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameStoreContext = createContext<GameStore | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore(): GameStore {
  const ctx = useContext(GameStoreContext);
  if (!ctx) throw new Error('useGameStore must be used within a GameProvider');
  return ctx;
}

