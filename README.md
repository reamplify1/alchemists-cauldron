# Alchemist's Cauldron

A browser puzzle game built for the RS School qualifying stage.

**Deploy:** https://reamplify1.github.io/alchemists-cauldron/

## Game goal

Add ingredients from the shelf to the cauldron and move three values — **Temperature**, **Density** and **Magic Power** — into the target ranges of a random recipe. Click **Brew** to check the mix. Keep brewing until the time ends, the lives run out, or the ingredients are gone.

## Task structure

- **Precondition** — repository setup, tooling, folder structure and quality checks
- **Level 1** — one full playable game: shelf, cauldron, parameter bars, recipe and brewing check, timer, lives, pause and a Top-10 leaderboard
- **Level 2** — difficulty selection and auto-save / continue game
- **Level 3** — drag & drop, tooltips, chemical reactions, Pour Out, keyboard shortcuts and visual feedback

## Tech stack

TypeScript without frameworks or game libraries, plain CSS, Vite.

## Project structure

```text
src/
  assets/    icons and other game files
  data/      fixed tables: ingredients, recipes, difficulty, reactions
  logic/     pure game rules (no DOM): cauldron values, brew check, stock, timer
  state/     current game state
  storage/   save game and leaderboard in localStorage
  styles/    CSS
  types/     shared TypeScript types
  ui/        DOM rendering and event handling
  main.ts    entry point
```

Game rules live in `logic/` and never touch the DOM. `ui/` reads the state and calls the logic.

## How to run

```bash
npm install
npm run dev
```

Other scripts:

- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run format` — format files with Prettier
