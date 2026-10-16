import { getStock } from '../logic/stock';
import type { IIngredient } from '../types/game';
import { getIngredientIcon } from './icons';

// "+25" for positive numbers, "-18" for negative, "0" for zero.
function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function createStat(label: string, value: number): HTMLElement {
  const stat = document.createElement('span');
  stat.className = 'ingredient-card__stat';
  stat.textContent = `${label} ${formatSigned(value)}`;
  return stat;
}

function createCard(
  ingredient: IIngredient,
  portionsLeft: number,
  isShelfBlocked: boolean,
): HTMLButtonElement {
  const isEmpty = portionsLeft === 0;

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'ingredient-card';
  card.dataset.ingredientId = ingredient.id;
  // A disabled button cannot be clicked or focused.
  card.disabled = isEmpty || isShelfBlocked;
  card.classList.toggle('ingredient-card--empty', isEmpty);
  card.setAttribute(
    'aria-label',
    isEmpty ? `${ingredient.name}, out of stock` : `Add ${ingredient.name}, ${portionsLeft} left`,
  );

  const stock = document.createElement('span');
  stock.className = 'ingredient-card__stock';
  stock.textContent = String(portionsLeft);

  const icon = document.createElement('span');
  icon.className = `ingredient-card__icon ingredient-icon--${ingredient.icon}`;
  // An empty slot shows no icon.
  icon.innerHTML = isEmpty ? '' : getIngredientIcon(ingredient.icon);

  const name = document.createElement('span');
  name.className = 'ingredient-card__name';
  name.textContent = ingredient.name;

  const stats = document.createElement('span');
  stats.className = 'ingredient-card__stats';
  stats.append(
    createStat('Temp', ingredient.temperature),
    createStat('Dens', ingredient.density),
    createStat('Magic', ingredient.magicPower),
  );

  card.append(stock, icon, name, stats);
  return card;
}

export function renderShelf(
  container: HTMLElement,
  ingredients: IIngredient[],
  shelfStock: Record<string, number>,
  isShelfBlocked: boolean,
): void {
  const cards = ingredients.map((ingredient) =>
    createCard(ingredient, getStock(shelfStock, ingredient.id), isShelfBlocked),
  );

  container.replaceChildren(...cards);
}
