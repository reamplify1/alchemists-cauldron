import type { ICauldronValues, IRecipe, IRecipeRange } from '../types/game';
import { isInRange } from './range';

// Widens a recipe range on both ends by the tolerance.
// Worked example: range 32..42, tolerance 8 -> checked range 24..50.
function expandRange(range: IRecipeRange, tolerance: number): IRecipeRange {
  return { min: range.min - tolerance, max: range.max + tolerance };
}

// Level 1 has no reactions: the brew check only compares the raw ingredient
// sums with the recipe ranges, each widened by the difficulty tolerance.
export function checkBrew(values: ICauldronValues, recipe: IRecipe, tolerance: number): boolean {
  return (
    isInRange(values.temperature, expandRange(recipe.temperature, tolerance)) &&
    isInRange(values.density, expandRange(recipe.density, tolerance)) &&
    isInRange(values.magicPower, expandRange(recipe.magicPower, tolerance))
  );
}
