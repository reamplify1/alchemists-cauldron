import type { IRecipe, IRecipeRange } from '../types/game';

export interface IRecipePanel {
  name: HTMLElement;
  ranges: HTMLElement;
  counter: HTMLElement;
}

// "32..42" — matches the README table notation.
function formatRange(range: IRecipeRange): string {
  return `${range.min}..${range.max}`;
}

function createRangeItem(label: string, range: IRecipeRange): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'recipe__range-item';
  item.textContent = `${label}: ${formatRange(range)}`;
  return item;
}

export function renderRecipe(
  panel: IRecipePanel,
  recipe: IRecipe | null,
  cauldronCount: number,
  maxCauldronSize: number,
): void {
  if (!recipe) {
    panel.name.textContent = 'Press Start Game to get a recipe';
    panel.ranges.replaceChildren();
    panel.counter.textContent = '';
    panel.counter.classList.remove('recipe__counter--full');
    return;
  }

  panel.name.textContent = recipe.name;
  panel.ranges.replaceChildren(
    createRangeItem('Temperature', recipe.temperature),
    createRangeItem('Density', recipe.density),
    createRangeItem('Magic Power', recipe.magicPower),
  );

  const isFull = cauldronCount >= maxCauldronSize;
  panel.counter.textContent = `Ingredients: ${cauldronCount} / ${maxCauldronSize}`;
  panel.counter.classList.toggle('recipe__counter--full', isFull);
}
