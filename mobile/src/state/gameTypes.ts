export type Phase = 'setup' | 'ready' | 'countdown' | 'playing' | 'turnRecap' | 'winner';

export type ContentRating = 'family' | 'afterDark';

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  playerIds: [string, string];
  score: number;
};

export type Prompt = {
  id: string;
  category: string;
  answer: string;
  rating: ContentRating;
};

export type TurnCardResult = {
  prompt: Prompt;
  result: 'correct' | 'skip';
};

export type GameState = {
  phase: Phase;
  players: Player[];
  teams: Team[];
  rating: ContentRating;
  selectedCategory: string | null;
  roundDurationSec: number;

  fullDeck: Prompt[];
  turnDeck: Prompt[];
  promptIndex: number;
  turnResults: TurnCardResult[];

  currentTeamIndex: number;
  guesserSlot: 0 | 1;

  remainingSeconds: number;
};

export type GameAction =
  | { type: 'UPDATE_PLAYER_NAME'; playerIndex: number; name: string }
  | { type: 'SET_PLAYER_COUNT'; count: number }
  | { type: 'SET_RATING'; rating: ContentRating }
  | { type: 'START_NIGHT'; promptDeck: Prompt[]; category: string }
  | { type: 'START_COUNTDOWN' }
  | { type: 'CANCEL_COUNTDOWN' }
  | { type: 'COUNTDOWN_DONE' }
  | { type: 'TIMER_TICK' }
  | { type: 'TIME_UP' }
  | { type: 'MARK_CORRECT' }
  | { type: 'MARK_SKIP' }
  | { type: 'ADVANCE_AFTER_RECAP' }
  | { type: 'PLAY_ANOTHER_ROUND' }
  | { type: 'END_SESSION' };

export const ROUND_DURATION_SEC = 60;
export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 12;
