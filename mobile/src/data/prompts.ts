import { CARS, MUSIC, PEOPLE, PLACES, SLANG, SPORT } from './decks';
import type { ContentRating, Prompt } from '../state/gameTypes';

export const DECK_CATEGORIES = ['Food', 'Places', 'People', 'Slang', 'Sport', 'Cars', 'Music'] as const;
export type DeckCategory = (typeof DECK_CATEGORIES)[number];

export const MIN_FAMILY_CARDS = 40;
export const MIN_AFTER_DARK_CARDS = 15;

function food(id: string, answer: string, rating: ContentRating): Prompt {
  return { id: `food-${id}`, category: 'Food', answer, rating };
}

const FOOD_FAMILY: Prompt[] = [
  food('f01', 'Braai', 'family'),
  food('f02', 'Biltong', 'family'),
  food('f03', 'Vetkoek', 'family'),
  food('f04', 'Magwinya', 'family'),
  food('f05', 'Sosatie', 'family'),
  food('f06', 'Boerewors', 'family'),
  food('f07', 'Pap', 'family'),
  food('f08', 'Chakalaka', 'family'),
  food('f09', 'Bunny chow', 'family'),
  food('f10', 'Gatsby', 'family'),
  food('f11', 'Kota', 'family'),
  food('f12', 'Koeksister', 'family'),
  food('f13', 'Malva pudding', 'family'),
  food('f14', 'Milk tart', 'family'),
  food('f15', 'Rusks', 'family'),
  food('f16', 'Rooibos', 'family'),
  food('f17', 'Mageu', 'family'),
  food('f18', 'Bobotie', 'family'),
  food('f19', 'Samp', 'family'),
  food('f20', 'Umngqusho', 'family'),
  food('f21', 'Walkie talkies', 'family'),
  food('f22', 'Slap chips', 'family'),
  food('f23', 'Peri peri', 'family'),
  food('f24', 'Mrs Balls chutney', 'family'),
  food('f25', 'Atchar', 'family'),
  food('f26', 'Polony', 'family'),
  food('f27', 'Russian', 'family'),
  food('f28', 'Cheese griller', 'family'),
  food('f29', 'Braai broodjie', 'family'),
  food('f30', 'Potjiekos', 'family'),
  food('f31', 'Snoek', 'family'),
  food('f32', 'Dombolo', 'family'),
  food('f33', 'Mogodu', 'family'),
  food('f34', 'Shisa nyama', 'family'),
  food('f35', 'Fanta grape', 'family'),
  food('f36', 'Cream soda', 'family'),
  food('f37', 'Chips and vienna', 'family'),
  food('f38', 'Amasi', 'family'),
  food('f39', 'Morogo', 'family'),
  food('f40', 'Smiley', 'family'),
  food('f41', 'Super M', 'family'),
  food('f42', 'White bread', 'family'),
  food('f43', 'Tomato sauce', 'family'),
  food('f44', 'Peppermint crisp', 'family'),
  food('f45', 'Frikkadel', 'family'),
];

const FOOD_AFTER_DARK: Prompt[] = [
  food('a01', 'Witblits', 'afterDark'),
  food('a02', 'Mampoer', 'afterDark'),
  food('a03', 'Klippies', 'afterDark'),
  food('a04', 'Dumpie', 'afterDark'),
  food('a05', 'Black Label', 'afterDark'),
  food('a06', 'Castle Lager', 'afterDark'),
  food('a07', 'Amarula', 'afterDark'),
  food('a08', 'Dop', 'afterDark'),
  food('a09', 'Shooters', 'afterDark'),
  food('a10', 'Tequila', 'afterDark'),
  food('a11', 'Hangover', 'afterDark'),
  food('a12', 'Last round', 'afterDark'),
  food('a13', 'Shebeen special', 'afterDark'),
  food('a14', 'Savannah Dry', 'afterDark'),
  food('a15', 'Nightcap', 'afterDark'),
  food('a16', 'Jäger bomb', 'afterDark'),
];

export const PROMPTS: Prompt[] = [
  ...FOOD_FAMILY,
  ...FOOD_AFTER_DARK,
  ...PLACES,
  ...PEOPLE,
  ...SLANG,
  ...SPORT,
  ...CARS,
  ...MUSIC,
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
