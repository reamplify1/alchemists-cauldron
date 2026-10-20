import type { IIngredient, IRecipe, IRecipeRange, ISavedGame } from '../types/game';

const STORAGE_KEY = 'alchemists-cauldron:save';

function isValidRange(value: unknown): value is IRecipeRange {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const range = value as Record<string, unknown>;
  return typeof range.min === 'number' && typeof range.max === 'number';
}

function isValidRecipe(value: unknown): value is IRecipe {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const recipe = value as Record<string, unknown>;
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    (recipe.difficulty === 'easy' ||
      recipe.difficulty === 'medium' ||
      recipe.difficulty === 'hard') &&
    isValidRange(recipe.temperature) &&
    isValidRange(recipe.density) &&
    isValidRange(recipe.magicPower)
  );
}

function isValidIngredient(value: unknown): value is IIngredient {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const ingredient = value as Record<string, unknown>;
  return (
    typeof ingredient.id === 'string' &&
    typeof ingredient.name === 'string' &&
    typeof ingredient.icon === 'string' &&
    typeof ingredient.temperature === 'number' &&
    typeof ingredient.density === 'number' &&
    typeof ingredient.magicPower === 'number'
  );
}

function isValidStock(value: unknown): value is Record<string, number> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((amount) => typeof amount === 'number')
  );
}

// Only a "playing" or "paused" save describes an unfinished game — a
// finished game is never offered as Continue Game.
function isValidSave(data: unknown): data is ISavedGame {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const save = data as Record<string, unknown>;
  return (
    (save.difficulty === 'easy' || save.difficulty === 'medium' || save.difficulty === 'hard') &&
    typeof save.score === 'number' &&
    typeof save.timeLeft === 'number' &&
    typeof save.lives === 'number' &&
    (save.activeRecipe === null || isValidRecipe(save.activeRecipe)) &&
    Array.isArray(save.cauldronIngredients) &&
    save.cauldronIngredients.every(isValidIngredient) &&
    isValidStock(save.shelfStock) &&
    (save.status === 'playing' || save.status === 'paused')
  );
}

// Writes the save. Fails silently (quota exceeded, storage disabled) so
// auto-saving never crashes the game.
export function saveGame(save: ISavedGame): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // Ignored on purpose: a failed save should not break the game.
  }
}

// Reads the save. Returns null when there is none, it is broken, or it
// does not describe an unfinished game — a broken save is deleted so it is
// never checked again (see clearSave below).
export function loadGame(): ISavedGame | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (isValidSave(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through: a storage or parsing error is treated like a broken save.
  }

  clearSave();
  return null;
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignored on purpose.
  }
}
