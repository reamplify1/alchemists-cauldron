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
import { pickRandomRecipe } from '../logic/recipe-generator';
import { createStock, getStock } from '../logic/stock';
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

export function getSettings(): IDifficultySettings {
  return DIFFICULTY_SETTINGS[getDifficulty()];
}

// The first N ingredients of the catalogue, N depends on the difficulty.
export function getShelfIngredients(): IIngredient[] {
  return INGREDIENTS.slice(0, getSettings().shelfSize);
}

export function getCauldronValues(): ICauldronValues {
  return calculateCauldron(gameState.cauldronIngredients);
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

function endGame(reason: GameOverReason): void {
  gameState.status = 'game-over';
  gameState.gameOverReason = reason;
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
  gameState.shelfStock = createStock(getShelfIngredients());
  gameState.cauldronIngredients = [];
  gameState.activeRecipe = pickRandomRecipe(RECIPES, getDifficulty());
  setTimeLeft(settings.startingTimeSeconds);
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

  gameState.cauldronIngredients = result.cauldronIngredients;
  gameState.shelfStock = result.shelfStock;
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
  return success;
}
