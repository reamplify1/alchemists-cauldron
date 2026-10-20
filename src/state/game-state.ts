import {
  DIFFICULTY_SETTINGS,
  LEVEL_1_DIFFICULTY,
  type IDifficultySettings,
} from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { calculateCauldron } from '../logic/calculate-cauldron';
import { addToCauldron } from '../logic/cauldron';
import { checkBrew } from '../logic/brew';
import {
  insertLeaderboardEntry,
  isValidPlayerName,
  qualifiesForLeaderboard,
} from '../logic/leaderboard';
import { applyReactions, getFiredReactions, getReactionsForDifficulty } from '../logic/reactions';
import { pickRandomRecipe } from '../logic/recipe-generator';
import { createStock, getStock } from '../logic/stock';
import { loadLeaderboard, saveLeaderboard } from '../storage/leaderboard';
import { clearSave, loadGame, saveGame } from '../storage/save-game';
import type {
  Difficulty,
  GameOverReason,
  ICauldronValues,
  IGameState,
  IIngredient,
} from '../types/game';

// The start screen state: empty shelf and cauldron, no recipe yet.
export function createInitialState(): IGameState {
  return {
    status: 'menu',
    score: 0,
    timeLeft: 0,
    lives: 0,
    activeRecipe: null,
    cauldronIngredients: [],
    shelfStock: {},
    difficulty: LEVEL_1_DIFFICULTY,
    gameOverReason: undefined,
    scoreSaved: false,
    lastReactionId: null,
  };
}

// One object with all current game data.
export const gameState: IGameState = createInitialState();

// The timestamp (Date.now()) at which the countdown reaches 0. Only
// meaningful while status is "playing". timeLeft is always recalculated
// from this timestamp, never by counting ticks, so the timer stays correct
// even after the browser tab was in the background for a while.
let endTimestamp = 0;

export function getDifficulty(): Difficulty {
  return gameState.difficulty ?? LEVEL_1_DIFFICULTY;
}

// The difficulty can only be changed from the start screen, never during a
// running (or paused, or just-finished) game.
export function setDifficulty(difficulty: Difficulty): void {
  if (gameState.status !== 'menu') {
    return;
  }

  gameState.difficulty = difficulty;
}

export function getSettings(): IDifficultySettings {
  return DIFFICULTY_SETTINGS[getDifficulty()];
}

// The first N ingredients of the catalogue, N depends on the difficulty.
export function getShelfIngredients(): IIngredient[] {
  return INGREDIENTS.slice(0, getSettings().shelfSize);
}

// Raw ingredient sum, with every currently active reaction's effect folded
// on top (see US 3.3). Recalculated fresh from the ingredient list every
// time this is called, so a reaction's value change keeps applying for as
// long as its combination stays in the cauldron.
export function getCauldronValues(): ICauldronValues {
  const reactions = getReactionsForDifficulty(getDifficulty());
  const baseValues = calculateCauldron(gameState.cauldronIngredients);
  return applyReactions(baseValues, reactions, gameState.cauldronIngredients);
}

// Sets a new countdown value and remembers when it will reach 0.
function setTimeLeft(seconds: number): void {
  gameState.timeLeft = seconds;
  endTimestamp = Date.now() + seconds * 1000;
}

// Recalculates timeLeft from the stored end timestamp instead of counting
// ticks, so a throttled or backgrounded tab cannot make it drift.
function refreshTimeLeft(): void {
  if (gameState.status !== 'playing') {
    return;
  }

  gameState.timeLeft = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000));
}

// Shifts the timer by the given number of seconds — negative removes time,
// as a reaction's one-time cost can do (see US 3.3). Moves the end
// timestamp itself (the single source of truth for the countdown), not
// just the cached timeLeft, so the change is not overwritten by the next
// recalculation. Can end the game, exactly like the timer reaching 0 on its
// own.
function adjustTimeLeft(deltaSeconds: number): void {
  endTimestamp += deltaSeconds * 1000;
  refreshTimeLeft();

  if (gameState.timeLeft <= 0) {
    endGame('time');
  }
}

function endGame(reason: GameOverReason): void {
  gameState.status = 'game-over';
  gameState.gameOverReason = reason;
  // A finished game is never offered as Continue Game.
  clearSave();
}

// Writes the auto-save. A no-op outside "playing"/"paused" (e.g. right
// after endGame already cleared it), so callers can call this
// unconditionally after any state change instead of tracking by hand
// whether this particular change was worth saving.
function persistGame(): void {
  if (gameState.status !== 'playing' && gameState.status !== 'paused') {
    return;
  }

  saveGame({
    difficulty: getDifficulty(),
    score: gameState.score,
    timeLeft: gameState.timeLeft,
    lives: gameState.lives,
    activeRecipe: gameState.activeRecipe,
    cauldronIngredients: gameState.cauldronIngredients,
    shelfStock: gameState.shelfStock,
    status: gameState.status,
  });
}

// True once every shelf slot is empty (stock 0) and the cauldron is empty
// too. See "Out of ingredients" in the README.
function isOutOfIngredients(): boolean {
  const shelfIsEmpty = getShelfIngredients().every(
    (ingredient) => getStock(gameState.shelfStock, ingredient.id) === 0,
  );

  return shelfIsEmpty && gameState.cauldronIngredients.length === 0;
}

function checkOutOfIngredients(): void {
  if (gameState.status === 'playing' && isOutOfIngredients()) {
    endGame('ingredients');
  }
}

// A new random stock, an empty cauldron and a random recipe. Switches the
// game from the start screen (or a finished game) to the active game state.
export function startNewGame(): void {
  const settings = getSettings();

  gameState.status = 'playing';
  gameState.score = 0;
  gameState.lives = settings.lives;
  gameState.gameOverReason = undefined;
  gameState.scoreSaved = false;
  gameState.lastReactionId = null;
  gameState.shelfStock = createStock(getShelfIngredients());
  gameState.cauldronIngredients = [];
  gameState.activeRecipe = pickRandomRecipe(RECIPES, getDifficulty());
  setTimeLeft(settings.startingTimeSeconds);
  // Overwrites any old unfinished save with this new game.
  persistGame();
}

// Freezes the countdown and blocks gameplay actions (addIngredient and brew
// already check for "playing") until the game is resumed.
export function pauseGame(): void {
  if (gameState.status !== 'playing') {
    return;
  }

  refreshTimeLeft();
  gameState.status = 'paused';
  persistGame();
}

// Continues the same game from where it was paused: the timer resumes from
// the frozen timeLeft instead of restarting.
export function resumeGame(): void {
  if (gameState.status !== 'paused') {
    return;
  }

  setTimeLeft(gameState.timeLeft);
  gameState.status = 'playing';
  persistGame();
}

// Leaves the current run (paused or not) and returns to the start screen.
export function exitToMenu(): void {
  clearSave();
  Object.assign(gameState, createInitialState());
}

// Recalculates the timer and ends the game when it reaches 0. Call this
// regularly (e.g. from an interval in the UI layer) while a game may be
// running; it does nothing outside the "playing" status.
export function tick(): void {
  if (gameState.status !== 'playing') {
    return;
  }

  refreshTimeLeft();

  if (gameState.timeLeft <= 0) {
    endGame('time');
  }

  // Keeps timeLeft fresh in the save while playing (a no-op once endGame
  // just cleared it above).
  persistGame();
}

// Applies the one-time side effects (time, lives, clearing the cauldron) of
// every reaction that just turned on with this add, in table order — not
// of reactions that were already active before it (see US 3.3). The
// reactions' own value changes are not applied here: getCauldronValues()
// above folds those in fresh every time, for as long as each stays active.
function applyFiredReactions(before: IIngredient[], after: IIngredient[]): void {
  const reactions = getReactionsForDifficulty(getDifficulty());
  const fired = getFiredReactions(reactions, before, after);

  for (const reaction of fired) {
    // A reaction that just ended the game (lives or time running out)
    // stops the rest of the batch from applying further side effects.
    if (gameState.status !== 'playing') {
      return;
    }

    gameState.lastReactionId = reaction.id;

    if (reaction.clearsCauldron) {
      gameState.cauldronIngredients = [];
    }

    if (reaction.livesDelta) {
      gameState.lives += reaction.livesDelta;

      if (gameState.lives <= 0) {
        endGame('lives');
      }
    }

    if (reaction.timeDeltaSeconds) {
      adjustTimeLeft(reaction.timeDeltaSeconds);
    }
  }
}

// Returns true when the ingredient was added.
export function addIngredient(ingredientId: string): boolean {
  if (gameState.status !== 'playing') {
    return false;
  }

  const ingredient = getShelfIngredients().find((item) => item.id === ingredientId);

  if (!ingredient) {
    return false;
  }

  const result = addToCauldron(
    ingredient,
    gameState.cauldronIngredients,
    gameState.shelfStock,
    getSettings().maxCauldronSize,
  );

  if (!result) {
    return false;
  }

  const ingredientsBeforeAdd = gameState.cauldronIngredients;
  gameState.cauldronIngredients = result.cauldronIngredients;
  gameState.shelfStock = result.shelfStock;

  applyFiredReactions(ingredientsBeforeAdd, gameState.cauldronIngredients);

  // A reaction clearing the cauldron can leave the shelf and cauldron both
  // empty at once, the same "stuck" state brew() already checks for.
  if (gameState.status === 'playing') {
    checkOutOfIngredients();
  }

  persistGame();
  return true;
}

// Brew is only allowed while a game is running and the cauldron is not empty.
export function canBrew(): boolean {
  return gameState.status === 'playing' && gameState.cauldronIngredients.length >= 1;
}

// Checks the cauldron against the active recipe and applies the result.
// On success: score and a time bonus (capped at the starting time), cauldron
// cleared, a new recipe picked. On failure: one life lost, cauldron cleared,
// the recipe stays the same. Either way, running out of lives or ingredients
// ends the game. Returns true when the brew succeeded.
export function brew(): boolean {
  if (!canBrew() || !gameState.activeRecipe) {
    return false;
  }

  const settings = getSettings();
  const success = checkBrew(getCauldronValues(), gameState.activeRecipe, settings.tolerance);

  if (success) {
    gameState.score += settings.scorePerBrew;
    refreshTimeLeft();
    setTimeLeft(
      Math.min(gameState.timeLeft + settings.timeBonusSeconds, settings.startingTimeSeconds),
    );
    gameState.cauldronIngredients = [];
    gameState.activeRecipe = pickRandomRecipe(RECIPES, getDifficulty());
  } else {
    gameState.lives -= 1;
    gameState.cauldronIngredients = [];

    if (gameState.lives <= 0) {
      endGame('lives');
      return success;
    }
  }

  checkOutOfIngredients();
  persistGame();
  return success;
}

// True only while the start screen has a valid, unfinished save to offer
// as Continue Game.
export function hasContinuableSave(): boolean {
  return loadGame() !== null;
}

// Restores the saved game and opens it paused (not however it was saved),
// so the player consciously resumes rather than being dropped straight
// into a running countdown. The saved shelf stock is restored as-is, never
// re-rolled. Returns false (and changes nothing) when there is no valid
// save or a game is already running.
export function continueGame(): boolean {
  if (gameState.status !== 'menu') {
    return false;
  }

  const save = loadGame();

  if (!save) {
    return false;
  }

  gameState.difficulty = save.difficulty;
  gameState.score = save.score;
  gameState.timeLeft = save.timeLeft;
  gameState.lives = save.lives;
  gameState.activeRecipe = save.activeRecipe;
  gameState.cauldronIngredients = save.cauldronIngredients;
  gameState.shelfStock = save.shelfStock;
  gameState.gameOverReason = undefined;
  gameState.scoreSaved = false;
  gameState.lastReactionId = null;
  gameState.status = 'paused';
  persistGame();

  return true;
}

// True while the current game-over score still qualifies for the Top 10
// and has not been saved yet. Reflects the leaderboard as it is right now,
// so it stays correct even if the board was cleared in another tab.
export function canSaveScore(): boolean {
  return (
    gameState.status === 'game-over' &&
    !gameState.scoreSaved &&
    qualifiesForLeaderboard(loadLeaderboard(getDifficulty()), gameState.score)
  );
}

function makeEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Saves the current score under the given name. Returns false (and saves
// nothing) when the name is invalid or saving is not currently allowed.
export function saveScore(name: string): boolean {
  const trimmedName = name.trim();

  if (!canSaveScore() || !isValidPlayerName(trimmedName)) {
    return false;
  }

  const entry = {
    id: makeEntryId(),
    name: trimmedName,
    score: gameState.score,
    date: Date.now(),
  };

  const difficulty = getDifficulty();
  saveLeaderboard(difficulty, insertLeaderboardEntry(loadLeaderboard(difficulty), entry));
  gameState.scoreSaved = true;
  return true;
}
