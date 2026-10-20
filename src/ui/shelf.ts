import { getStock } from '../logic/stock';
import type { IIngredient } from '../types/game';
import { getIngredientIcon } from './icons';

// "+25" for positive values, "−18" for negative values (a real minus sign,
// U+2212, not a plain hyphen), "0" for zero.
function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  if (value < 0) {
    return `−${Math.abs(value)}`;
  }

  return '0';
}

function createStat(label: string, value: number): HTMLElement {
  const stat = document.createElement('span');
  stat.className = 'ingredient-card__tooltip-stat';
  stat.textContent = `${label} ${formatSigned(value)}`;
  return stat;
}

// The tooltip only ever shows the ingredient's own base values (see US 3.2);
// it starts with no position class, positioned by positionTooltip() below
// once the card is in the page.
function createTooltip(ingredient: IIngredient): HTMLElement {
  const tooltip = document.createElement('span');
  tooltip.className = 'ingredient-card__tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.append(
    createStat('Temp', ingredient.temperature),
    createStat('Dens', ingredient.density),
    createStat('Magic', ingredient.magicPower),
  );
  return tooltip;
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
  // Out of stock (or shelf blocked) ingredients cannot be dragged either.
  card.draggable = !isEmpty && !isShelfBlocked;
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

  // In Level 3 the card itself only shows the icon and name; the numbers
  // move into this tooltip instead (shown on hover/focus, see style.css).
  card.append(stock, icon, name, createTooltip(ingredient));
  return card;
}

// Approximate tooltip size in pixels, used only to decide which side has
// room — the tooltip itself cannot be measured while hidden (it has no
// layout box), so this is simpler and good enough than showing it first
// just to read its real size.
const TOOLTIP_WIDTH_PX = 160;
const TOOLTIP_HEIGHT_PX = 90;

// Flips the tooltip to open left/up instead of its default right/down
// whenever the card sits too close to that edge of the viewport for it to
// fit (see US 3.2). Must run after the card is attached to the page, since
// getBoundingClientRect() needs real layout.
function positionTooltip(card: HTMLElement): void {
  const tooltip = card.querySelector<HTMLElement>('.ingredient-card__tooltip');

  if (!tooltip) {
    return;
  }

  const cardRect = card.getBoundingClientRect();
  const opensLeft = window.innerWidth - cardRect.right < TOOLTIP_WIDTH_PX;
  const opensUp = window.innerHeight - cardRect.bottom < TOOLTIP_HEIGHT_PX;

  tooltip.classList.toggle('tooltip--left', opensLeft);
  tooltip.classList.toggle('tooltip--up', opensUp);
}

// The signature of the last shelf actually drawn. render() in main.ts runs
// on every 250ms timer tick regardless of whether anything changed, but
// rebuilding every card every time would replace the element the mouse is
// currently over with a new one — losing the browser's native :hover state
// mid-hover, which is what the tooltip's visibility depends on (see
// style.css), and made it flicker. Skipping the rebuild when nothing in the
// shelf actually changed keeps the hovered card's DOM node (and its open
// tooltip) in place.
let lastRenderKey = '';

export function renderShelf(
  container: HTMLElement,
  ingredients: IIngredient[],
  shelfStock: Record<string, number>,
  isShelfBlocked: boolean,
): void {
  const renderKey = JSON.stringify({
    ids: ingredients.map((ingredient) => ingredient.id),
    stock: ingredients.map((ingredient) => getStock(shelfStock, ingredient.id)),
    isShelfBlocked,
  });

  if (renderKey === lastRenderKey) {
    return;
  }

  lastRenderKey = renderKey;

  const cards = ingredients.map((ingredient) =>
    createCard(ingredient, getStock(shelfStock, ingredient.id), isShelfBlocked),
  );

  container.replaceChildren(...cards);
  // Only meaningful once the cards are actually in the page (see above).
  cards.forEach(positionTooltip);
}
