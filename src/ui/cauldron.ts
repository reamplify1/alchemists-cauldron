import type { IIngredient } from '../types/game';
import { getIngredientIcon } from './icons';

function createItem(ingredient: IIngredient): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'cauldron__item';

  const icon = document.createElement('span');
  icon.className = `cauldron__icon ingredient-icon--${ingredient.icon}`;
  icon.innerHTML = getIngredientIcon(ingredient.icon);

  const name = document.createElement('span');
  name.textContent = ingredient.name;

  item.append(icon, name);
  return item;
}

// The ingredient counter lives on the recipe panel (see ui/recipe.ts); this
// list only shows what is currently in the cauldron.
export function renderCauldron(list: HTMLElement, ingredients: IIngredient[]): void {
  if (ingredients.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'cauldron__empty';
    empty.textContent = 'The cauldron is empty';
    list.replaceChildren(empty);
    return;
  }

  // Same order as the ingredients were added.
  list.replaceChildren(...ingredients.map((ingredient) => createItem(ingredient)));
}
