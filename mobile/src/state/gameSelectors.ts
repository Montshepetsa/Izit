import type { GameState, Player, Team } from './gameTypes';

export function getCurrentTeam(state: GameState): Team | null {
  return state.teams[state.currentTeamIndex] ?? null;
}

export function playerById(state: GameState, id: string): Player | null {
  return state.players.find((p) => p.id === id) ?? null;
}

export function getGuesser(state: GameState): Player | null {
  const team = getCurrentTeam(state);
  if (!team) return null;
  const id = team.playerIds[state.guesserSlot];
  return playerById(state, id);
}

export function getPartner(state: GameState): Player | null {
  const team = getCurrentTeam(state);
  if (!team) return null;
  const partnerSlot = state.guesserSlot === 0 ? 1 : 0;
  const id = team.playerIds[partnerSlot];
  return playerById(state, id);
}

export function getCurrentPrompt(state: GameState) {
  return state.turnDeck[state.promptIndex] ?? null;
}

export function getTurnCorrectCount(state: GameState): number {
  return state.turnResults.filter((r) => r.result === 'correct').length;
}

export function getTurnSkipCount(state: GameState): number {
  return state.turnResults.filter((r) => r.result === 'skip').length;
}

export function isLastGuesserOfNight(state: GameState): boolean {
  const lastTeam = state.currentTeamIndex >= state.teams.length - 1;
  return lastTeam && state.guesserSlot === 1;
}

export function getWinningTeams(state: GameState): Team[] {
  if (state.teams.length === 0) return [];
  const top = Math.max(...state.teams.map((t) => t.score));
  return state.teams.filter((t) => t.score === top);
}

export function teamLabel(state: GameState, team: Team): string {
  const a = playerById(state, team.playerIds[0])?.name ?? 'Player';
  const b = playerById(state, team.playerIds[1])?.name ?? 'Player';
  return `${a} + ${b}`;
}

export function nextGuesser(state: GameState): Player | null {
  if (isLastGuesserOfNight(state)) return null;
  if (state.guesserSlot === 0) {
    const team = getCurrentTeam(state);
    if (!team) return null;
    return playerById(state, team.playerIds[1]);
  }
  const nextTeam = state.teams[state.currentTeamIndex + 1];
  if (!nextTeam) return null;
  return playerById(state, nextTeam.playerIds[0]);
}
