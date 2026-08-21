# Izit Mobile

Mzansi Heads Up on one phone. Built with Expo and React Native.

## How to play

1. **Setup** — even number of named players (minimum 4), pair 1–2 / 3–4, pick Family or After Dark, pick a deck.
2. **Ready** — guesser puts the phone on their forehead, screen out. Only their partner gives clues.
3. **Play** — 60 seconds. Tilt down for correct, tilt up to skip. Tiny buttons are a fallback if tilt is dead.
4. **Recap** — check the words, add to the pair total, pass inside the pair, then the next pair.
5. **Winner** — everyone guesses once. Highest pair total wins. Play another round keeps the same pairs.

Only **Food** is on the setup screen until other decks hit 40 Family cards and 15 After Dark cards.

## Prerequisites

- Node.js 20+
- npm
- [Expo Go](https://expo.dev/go) on a device, or Xcode / Android Studio for native builds

Tilt needs a real device. Expo Go on a phone is the way to try it. Simulator / web can use the Skip and Correct fallbacks.

## Setup

```bash
cd mobile
npm install
```

## Development

```bash
npm start        # Expo dev server
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web preview (tilt fallback only)
```

## Quality checks

```bash
npm run typecheck
npm test
npm run check    # typecheck + tests
```

## Project structure

```
src/
  components/    # Timer, icons
  data/          # Prompt decks
  hooks/         # Forehead tilt, orientation
  screens/       # SetupScreen, PlayScreen
  state/         # gameReducer, store, types
  theme/
```

## Ship notes

- Update `app.json` (`name`, `slug`, `bundleIdentifier`) before store submission
- Run `npx expo prebuild` when generating native `ios/` / `android/` projects
- Use [EAS Build](https://docs.expo.dev/build/introduction/) for production binaries
