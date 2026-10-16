import type { ICauldronValues, IIngredient } from '../types/game';

// The cauldron values are the sum of all added ingredients.
// An empty cauldron gives 0 / 0 / 0.
export function calculateCauldron(ingredients: IIngredient[]): ICauldronValues {
  const total: ICauldronValues = { temperature: 0, density: 0, magicPower: 0 };

  for (const ingredient of ingredients) {
    total.temperature += ingredient.temperature;
    total.density += ingredient.density;
    total.magicPower += ingredient.magicPower;
  }

  return total;
}
