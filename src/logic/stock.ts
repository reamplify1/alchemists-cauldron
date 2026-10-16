import { MAX_STOCK, MIN_STOCK } from '../data/difficulty';
import type { IIngredient } from '../types/game';

// A random whole number from MIN_STOCK to MAX_STOCK (2..15), both included.
// `random` can be replaced in tests; the game uses Math.random.
export function getRandomStock(random: () => number = Math.random): number {
  const rangeSize = MAX_STOCK - MIN_STOCK + 1;
  return Math.floor(random() * rangeSize) + MIN_STOCK;
}

// Gives every shelf ingredient its own random stock for a new game.
export function createStock(
  ingredients: IIngredient[],
  random: () => number = Math.random,
): Record<string, number> {
  const stock: Record<string, number> = {};

  for (const ingredient of ingredients) {
    stock[ingredient.id] = getRandomStock(random);
  }

  return stock;
}

export function getStock(stock: Record<string, number>, ingredientId: string): number {
  return stock[ingredientId] ?? 0;
}
