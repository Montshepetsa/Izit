import { ARTISTS, CARS, DRINKS, FOOD, PEOPLE, PLACES, SLANG, SONGS, SPORT } from './decks';
import type { ContentRating, Prompt } from '../state/gameTypes';

export const DECK_CATEGORIES = [
  'Food',
  'Drinks',
  'Places',
  'People',
  'Slang',
  'Sport',
  'Cars',
  'Artists',
  'Songs',
] as const;
export type DeckCategory = (typeof DECK_CATEGORIES)[number];

export const MIN_FAMILY_CARDS = 40;
export const MIN_AFTER_DARK_CARDS = 15;

export const PROMPTS: Prompt[] = [
  ...FOOD,
  ...DRINKS,
  ...PLACES,
  ...PEOPLE,
  ...SLANG,
  ...SPORT,
  ...CARS,
  ...ARTISTS,
  ...SONGS,
];

export function getDeckCards(category: string): Prompt[] {
  return PROMPTS.filter((p) => p.category === category);
}

export function isDeckReady(category: string): boolean {
  const cards = getDeckCards(category);
  const family = cards.filter((p) => p.rating === 'family').length;
  const afterDark = cards.filter((p) => p.rating === 'afterDark').length;
  return family >= MIN_FAMILY_CARDS && afterDark >= MIN_AFTER_DARK_CARDS;
}

export function getPlayableCategories(): string[] {
  return DECK_CATEGORIES.filter((category) => isDeckReady(category));
}

export function getPromptDeck(category: string, rating: ContentRating): Prompt[] {
  const cards = getDeckCards(category);
  if (rating === 'family') return cards.filter((p) => p.rating === 'family');
  return cards.slice();
}
