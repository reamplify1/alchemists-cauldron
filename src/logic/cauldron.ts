import type { IIngredient } from '../types/game';
import { getStock } from './stock';

export interface IAddIngredientResult {
  cauldronIngredients: IIngredient[];
  shelfStock: Record<string, number>;
}

export function isCauldronFull(cauldronIngredients: IIngredient[], maxSize: number): boolean {
  return cauldronIngredients.length >= maxSize;
}

// Returns the new cauldron and stock, or null when the ingredient cannot be
// added (no stock left or the cauldron is full). The old arrays are not
// changed, so the caller decides when to update the state.
export function addToCauldron(
  ingredient: IIngredient,
  cauldronIngredients: IIngredient[],
  shelfStock: Record<string, number>,
  maxSize: number,
): IAddIngredientResult | null {
  const portionsLeft = getStock(shelfStock, ingredient.id);

  if (portionsLeft <= 0 || isCauldronFull(cauldronIngredients, maxSize)) {
    return null;
  }

  return {
    cauldronIngredients: [...cauldronIngredients, ingredient],
    shelfStock: { ...shelfStock, [ingredient.id]: portionsLeft - 1 },
  };
}
