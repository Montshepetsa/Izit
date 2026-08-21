import { getPlayableCategories, getPromptDeck, isDeckReady, MIN_AFTER_DARK_CARDS, MIN_FAMILY_CARDS } from '../src/data/prompts';
import { getGuesser, getPartner, getTurnCorrectCount, getWinningTeams, isLastGuesserOfNight } from '../src/state/gameSelectors';
import { createInitialGameState, gameReducer } from '../src/state/gameReducer';
import type { Prompt } from '../src/state/gameTypes';

const deck: Prompt[] = [
  { id: 't1', category: 'Food', answer: 'Braai', rating: 'family' },
  { id: 't2', category: 'Food', answer: 'Biltong', rating: 'family' },
  { id: 't3', category: 'Food', answer: 'Pap', rating: 'family' },
];

function startNight(playerCount = 4) {
  let state = createInitialGameState();
  if (playerCount !== 4) {
    state = gameReducer(state, { type: 'SET_PLAYER_COUNT', count: playerCount });
  }
  state = gameReducer(state, { type: 'UPDATE_PLAYER_NAME', playerIndex: 0, name: 'Thabo' });
  state = gameReducer(state, { type: 'UPDATE_PLAYER_NAME', playerIndex: 1, name: 'Lebo' });
  state = gameReducer(state, { type: 'UPDATE_PLAYER_NAME', playerIndex: 2, name: 'Aisha' });
  state = gameReducer(state, { type: 'UPDATE_PLAYER_NAME', playerIndex: 3, name: 'Sipho' });
  return gameReducer(state, { type: 'START_NIGHT', promptDeck: deck, category: 'Food' });
}

function playThroughTurn(state: ReturnType<typeof startNight>, correct = 2, skip = 0) {
  let next = gameReducer(state, { type: 'START_COUNTDOWN' });
  next = gameReducer(next, { type: 'COUNTDOWN_DONE' });
  for (let i = 0; i < correct; i += 1) next = gameReducer(next, { type: 'MARK_CORRECT' });
  for (let i = 0; i < skip; i += 1) next = gameReducer(next, { type: 'MARK_SKIP' });
  if (next.phase === 'playing') next = gameReducer(next, { type: 'TIME_UP' });
  return next;
}

describe('prompts', () => {
  it('only lists Food until other decks hit size', () => {
    expect(getPlayableCategories()).toEqual(['Food']);
    expect(isDeckReady('Food')).toBe(true);
    expect(isDeckReady('Cars')).toBe(false);
  });

  it('Family deck omits After Dark cards', () => {
    const family = getPromptDeck('Food', 'family');
    const afterDark = getPromptDeck('Food', 'afterDark');
    expect(family.length).toBeGreaterThanOrEqual(MIN_FAMILY_CARDS);
    expect(family.every((p) => p.rating === 'family')).toBe(true);
    expect(afterDark.length - family.length).toBeGreaterThanOrEqual(MIN_AFTER_DARK_CARDS);
  });
});

describe('gameReducer heads-up night', () => {
  it('START_NIGHT pairs players and waits on the forehead screen', () => {
    const next = startNight();
    expect(next.phase).toBe('ready');
    expect(next.teams).toHaveLength(2);
    expect(next.teams[0]?.playerIds).toEqual(['p1', 'p2']);
    expect(getGuesser(next)?.name).toBe('Thabo');
    expect(getPartner(next)?.name).toBe('Lebo');
  });

  it('rejects an odd player count by clamping to even', () => {
    const initial = createInitialGameState();
    const next = gameReducer(initial, { type: 'SET_PLAYER_COUNT', count: 5 });
    expect(next.players).toHaveLength(4);
  });

  it('START_COUNTDOWN shuffles a unique turn deck then COUNTDOWN_DONE starts play', () => {
    const ready = startNight();
    const counting = gameReducer(ready, { type: 'START_COUNTDOWN' });
    expect(counting.phase).toBe('countdown');
    expect(counting.turnDeck).toHaveLength(deck.length);
    expect(new Set(counting.turnDeck.map((p) => p.id)).size).toBe(deck.length);
    const playing = gameReducer(counting, { type: 'COUNTDOWN_DONE' });
    expect(playing.phase).toBe('playing');
    expect(playing.remainingSeconds).toBe(60);
  });

  it('CANCEL_COUNTDOWN returns to ready without scoring', () => {
    const ready = startNight();
    const counting = gameReducer(ready, { type: 'START_COUNTDOWN' });
    const cancelled = gameReducer(counting, { type: 'CANCEL_COUNTDOWN' });
    expect(cancelled.phase).toBe('ready');
    expect(cancelled.turnDeck).toEqual([]);
    expect(cancelled.teams[0]?.score).toBe(0);
    expect(getGuesser(cancelled)?.name).toBe('Thabo');
  });

  it('MARK_CORRECT scores the guesser team and skip does not', () => {
    const ready = startNight();
    const recap = playThroughTurn(ready, 2, 1);
    expect(recap.phase).toBe('turnRecap');
    expect(getTurnCorrectCount(recap)).toBe(2);
    expect(recap.teams[0]?.score).toBe(2);
    expect(recap.teams[1]?.score).toBe(0);
  });

  it('pair goes back to back, then the next pair', () => {
    let state = playThroughTurn(startNight(), 1, 0);
    expect(isLastGuesserOfNight(state)).toBe(false);
    state = gameReducer(state, { type: 'ADVANCE_AFTER_RECAP' });
    expect(state.phase).toBe('ready');
    expect(getGuesser(state)?.name).toBe('Lebo');
    expect(getPartner(state)?.name).toBe('Thabo');

    state = playThroughTurn(state, 1, 0);
    state = gameReducer(state, { type: 'ADVANCE_AFTER_RECAP' });
    expect(getGuesser(state)?.name).toBe('Aisha');
    expect(getPartner(state)?.name).toBe('Sipho');
  });

  it('after everyone guesses, winner is the pair with the higher total', () => {
    let state = startNight();
    state = playThroughTurn(state, 2, 0);
    state = gameReducer(state, { type: 'ADVANCE_AFTER_RECAP' });
    state = playThroughTurn(state, 1, 0);
    state = gameReducer(state, { type: 'ADVANCE_AFTER_RECAP' });
    state = playThroughTurn(state, 0, 1);
    state = gameReducer(state, { type: 'ADVANCE_AFTER_RECAP' });
    state = playThroughTurn(state, 0, 1);
    expect(isLastGuesserOfNight(state)).toBe(true);
    state = gameReducer(state, { type: 'ADVANCE_AFTER_RECAP' });
    expect(state.phase).toBe('winner');
    expect(state.teams[0]?.score).toBe(3);
    expect(state.teams[1]?.score).toBe(0);
    expect(getWinningTeams(state)[0]?.id).toBe('t1');
  });

  it('PLAY_ANOTHER_ROUND keeps pairs and clears scores', () => {
    let state = startNight();
    for (let i = 0; i < 4; i += 1) {
      state = playThroughTurn(state, 1, 0);
      state = gameReducer(state, { type: 'ADVANCE_AFTER_RECAP' });
    }
    expect(state.phase).toBe('winner');
    const again = gameReducer(state, { type: 'PLAY_ANOTHER_ROUND' });
    expect(again.phase).toBe('ready');
    expect(again.teams.every((t) => t.score === 0)).toBe(true);
    expect(getGuesser(again)?.name).toBe('Thabo');
    expect(again.selectedCategory).toBe('Food');
  });

  it('END_SESSION returns to setup and keeps names', () => {
    const mid = startNight();
    const reset = gameReducer(mid, { type: 'END_SESSION' });
    expect(reset.phase).toBe('setup');
    expect(reset.fullDeck).toEqual([]);
    expect(reset.players[0]?.name).toBe('Thabo');
  });
});
