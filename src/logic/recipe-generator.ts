import type { Difficulty, IRecipe } from '../types/game';

export function getRecipesForDifficulty(recipes: IRecipe[], difficulty: Difficulty): IRecipe[] {
  return recipes.filter((recipe) => recipe.difficulty === difficulty);
}

// One random recipe from the rows that match the current difficulty.
export function pickRandomRecipe(
  recipes: IRecipe[],
  difficulty: Difficulty,
  random: () => number = Math.random,
): IRecipe {
  const options = getRecipesForDifficulty(recipes, difficulty);
  const recipe = options[Math.floor(random() * options.length)];

  if (!recipe) {
    throw new Error(`There are no recipes for the "${difficulty}" difficulty.`);
  }

  return recipe;
}
