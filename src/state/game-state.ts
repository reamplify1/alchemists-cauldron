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
import { createStock } from '../logic/stock';
import type { Difficulty, ICauldronValues, IGameState, IIngredient } from '../types/game';

// US 1.3 fixes the time bonus cap at 120 s on its own, ahead of the full
// timer (US 1.4), which will cap it at the difficulty's starting time instead.
const BREW_TIME_BONUS_CAP_SECONDS = 120;

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
  };
}

// One object with all current game data.
export const gameState: IGameState = createInitialState();

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

// A new random stock, an empty cauldron and a random recipe. Switches the
// game from the start screen to the active game state.
export function startNewGame(): void {
  gameState.status = 'playing';
  gameState.shelfStock = createStock(getShelfIngredients());
  gameState.cauldronIngredients = [];
  gameState.activeRecipe = pickRandomRecipe(RECIPES, getDifficulty());
}

// Returns true when the ingredient was added.
export function addIngredient(ingredientId: string): boolean {
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
// On success: score and time bonus, cauldron cleared, a new recipe picked.
// On failure: one life lost, cauldron cleared, the recipe stays the same.
// Returns true when the brew succeeded.
export function brew(): boolean {
  if (!canBrew() || !gameState.activeRecipe) {
    return false;
  }

  const settings = getSettings();
  const success = checkBrew(getCauldronValues(), gameState.activeRecipe, settings.tolerance);

  if (success) {
    gameState.score += settings.scorePerBrew;
    gameState.timeLeft = Math.min(
      gameState.timeLeft + settings.timeBonusSeconds,
      BREW_TIME_BONUS_CAP_SECONDS,
    );
    gameState.cauldronIngredients = [];
    gameState.activeRecipe = pickRandomRecipe(RECIPES, getDifficulty());
  } else {
    gameState.lives -= 1;
    gameState.cauldronIngredients = [];
  }

  return success;
}
