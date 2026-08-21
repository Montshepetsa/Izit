import {
  getCurrentPrompt,
  getTurnCorrectCount,
  isLastGuesserOfNight,
} from './gameSelectors';
import type { GameAction, GameState, Player, Team } from './gameTypes';
import { MAX_PLAYERS, MIN_PLAYERS, ROUND_DURATION_SEC } from './gameTypes';
import { shuffle } from '../utils/shuffle';

function makePlayers(count: number, existing: Player[] = []): Player[] {
  return Array.from({ length: count }, (_, i): Player => {
    const prev = existing[i];
    if (prev) return prev;
    return { id: `p${i + 1}`, name: `Player ${i + 1}` };
  });
}

function buildTeams(players: Player[]): Team[] {
  const teams: Team[] = [];
  for (let i = 0; i + 1 < players.length; i += 2) {
    const a = players[i];
    const b = players[i + 1];
    if (!a || !b) continue;
    teams.push({
      id: `t${teams.length + 1}`,
      playerIds: [a.id, b.id],
      score: 0,
    });
  }
  return teams;
}

function clampEvenPlayerCount(count: number): number {
  const bounded = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.round(count)));
  return bounded % 2 === 0 ? bounded : bounded - 1;
}

export function createInitialGameState(): GameState {
  const players = makePlayers(MIN_PLAYERS);
  return {
    phase: 'setup',
    players,
    teams: [],
    rating: 'family',
    selectedCategory: null,
    roundDurationSec: ROUND_DURATION_SEC,
    fullDeck: [],
    turnDeck: [],
    promptIndex: 0,
    turnResults: [],
    currentTeamIndex: 0,
    guesserSlot: 0,
    remainingSeconds: ROUND_DURATION_SEC,
  };
}

function dealTurn(state: GameState, phase: 'countdown' | 'playing'): GameState {
  const turnDeck = shuffle(state.fullDeck);
  if (turnDeck.length === 0) return state;
  return {
    ...state,
    phase,
    turnDeck,
    promptIndex: 0,
    turnResults: [],
    remainingSeconds: state.roundDurationSec,
  };
}

function awardTurnAndRecap(state: GameState): GameState {
  const points = getTurnCorrectCount(state);
  const teams = state.teams.map((team, idx) =>
    idx === state.currentTeamIndex ? { ...team, score: team.score + points } : team
  );
  return {
    ...state,
    phase: 'turnRecap',
    teams,
    remainingSeconds: 0,
  };
}

function advanceGuesser(state: GameState): GameState {
  if (isLastGuesserOfNight(state)) {
    return { ...state, phase: 'winner', turnDeck: [], promptIndex: 0 };
  }
  if (state.guesserSlot === 0) {
    return {
      ...state,
      phase: 'ready',
      guesserSlot: 1,
      turnDeck: [],
      promptIndex: 0,
      turnResults: [],
    };
  }
  return {
    ...state,
    phase: 'ready',
    currentTeamIndex: state.currentTeamIndex + 1,
    guesserSlot: 0,
    turnDeck: [],
    promptIndex: 0,
    turnResults: [],
  };
}

function resolveCard(state: GameState, result: 'correct' | 'skip'): GameState {
  if (state.phase !== 'playing') return state;
  const prompt = getCurrentPrompt(state);
  if (!prompt) return awardTurnAndRecap(state);

  const turnResults = [...state.turnResults, { prompt, result }];
  const nextIndex = state.promptIndex + 1;
  if (nextIndex >= state.turnDeck.length) {
    return awardTurnAndRecap({ ...state, turnResults, promptIndex: nextIndex });
  }
  return { ...state, turnResults, promptIndex: nextIndex };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_PLAYER_NAME': {
      if (state.phase !== 'setup') return state;
      const players = state.players.map((p, idx) =>
        idx === action.playerIndex ? { ...p, name: action.name } : p
      );
      return { ...state, players };
    }

    case 'SET_PLAYER_COUNT': {
      if (state.phase !== 'setup') return state;
      const count = clampEvenPlayerCount(action.count);
      return { ...state, players: makePlayers(count, state.players) };
    }

    case 'SET_RATING': {
      if (state.phase !== 'setup') return state;
      return { ...state, rating: action.rating };
    }

    case 'START_NIGHT': {
      if (state.phase !== 'setup') return state;
      if (state.players.length < MIN_PLAYERS || state.players.length % 2 !== 0) return state;
      if (action.promptDeck.length === 0) return state;
      return {
        ...state,
        phase: 'ready',
        fullDeck: action.promptDeck,
        selectedCategory: action.category,
        teams: buildTeams(state.players),
        currentTeamIndex: 0,
        guesserSlot: 0,
        turnDeck: [],
        promptIndex: 0,
        turnResults: [],
        remainingSeconds: state.roundDurationSec,
      };
    }

    case 'START_COUNTDOWN': {
      if (state.phase !== 'ready') return state;
      return dealTurn(state, 'countdown');
    }

    case 'CANCEL_COUNTDOWN': {
      if (state.phase !== 'countdown') return state;
      return {
        ...state,
        phase: 'ready',
        turnDeck: [],
        promptIndex: 0,
        turnResults: [],
        remainingSeconds: state.roundDurationSec,
      };
    }

    case 'COUNTDOWN_DONE': {
      if (state.phase !== 'countdown') return state;
      return { ...state, phase: 'playing' };
    }

    case 'TIMER_TICK': {
      if (state.phase !== 'playing') return state;
      if (state.remainingSeconds <= 0) return state;
      return { ...state, remainingSeconds: state.remainingSeconds - 1 };
    }

    case 'TIME_UP': {
      if (state.phase !== 'playing') return state;
      return awardTurnAndRecap(state);
    }

    case 'MARK_CORRECT':
      return resolveCard(state, 'correct');

    case 'MARK_SKIP':
      return resolveCard(state, 'skip');

    case 'ADVANCE_AFTER_RECAP': {
      if (state.phase !== 'turnRecap') return state;
      return advanceGuesser(state);
    }

    case 'PLAY_ANOTHER_ROUND': {
      if (state.phase !== 'winner' || state.fullDeck.length === 0 || !state.selectedCategory) {
        return state;
      }
      return {
        ...state,
        phase: 'ready',
        teams: state.teams.map((t) => ({ ...t, score: 0 })),
        currentTeamIndex: 0,
        guesserSlot: 0,
        turnDeck: [],
        promptIndex: 0,
        turnResults: [],
        remainingSeconds: state.roundDurationSec,
      };
    }

    case 'END_SESSION':
      return {
        ...createInitialGameState(),
        players: state.players,
        rating: state.rating,
      };

    default:
      return state;
  }
}
