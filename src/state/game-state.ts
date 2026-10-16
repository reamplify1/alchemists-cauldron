import {
  DIFFICULTY_SETTINGS,
  LEVEL_1_DIFFICULTY,
  type IDifficultySettings,
} from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import { addToCauldron } from '../logic/cauldron';
import { createStock } from '../logic/stock';
import type { IGameState, IIngredient } from '../types/game';

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

export function getSettings(): IDifficultySettings {
  return DIFFICULTY_SETTINGS[gameState.difficulty ?? LEVEL_1_DIFFICULTY];
}

// The first N ingredients of the catalogue, N depends on the difficulty.
export function getShelfIngredients(): IIngredient[] {
  return INGREDIENTS.slice(0, getSettings().shelfSize);
}

// A new random stock and an empty cauldron, as at the start of every new game.
export function fillShelf(): void {
  gameState.shelfStock = createStock(getShelfIngredients());
  gameState.cauldronIngredients = [];
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
