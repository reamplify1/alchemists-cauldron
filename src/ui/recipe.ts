import { BARS, type IBarConfig } from '../data/bars';
import type { ICauldronValues, IRecipe, IRecipeRange } from '../types/game';

export interface IRecipePanel {
  name: HTMLElement;
  ranges: HTMLElement;
  counter: HTMLElement;
}

// Every stat a recipe sets, used to loop over the three bars together
// instead of repeating the same call three times.
const PARAMETERS = ['temperature', 'density', 'magicPower'] as const;

// "32..42" — matches the README table notation.
function formatRange(range: IRecipeRange): string {
  return `${range.min}..${range.max}`;
}

// Widens a recipe range by the difficulty's tolerance — the same widening
// brew() uses to decide success (see logic/brew.ts), so the green target
// zone drawn on the bar always matches what actually counts as a match.
function expandRange(range: IRecipeRange, tolerance: number): IRecipeRange {
  return { min: range.min - tolerance, max: range.max + tolerance };
}

// Clamps a value onto the bar's fixed scale and turns it into a 0-100%
// position, used for both the green target zone and the current-value
// marker.
function toPercent(value: number, bar: IBarConfig): number {
  const clamped = Math.min(Math.max(value, bar.min), bar.max);
  return ((clamped - bar.min) / (bar.max - bar.min)) * 100;
}

function getBar(parameter: IBarConfig['parameter']): IBarConfig {
  const bar = BARS.find((candidate) => candidate.parameter === parameter);

  if (!bar) {
    throw new Error(`No bar config for "${parameter}".`);
  }

  return bar;
}

// Updates one bar in place: its label, its green target zone and its
// current-value marker. The bar's own elements are static screen markup
// (see ui/game-screen.ts) and are never recreated here, so the marker's
// CSS transition on `left` has something to animate between on every call
// instead of restarting on a freshly rebuilt element — the same
// flicker-causing mistake renderShelf() had before it was fixed (US 3.2).
function updateBar(
  ranges: HTMLElement,
  parameter: IBarConfig['parameter'],
  range: IRecipeRange,
  tolerance: number,
  value: number,
): void {
  const item = ranges.querySelector<HTMLElement>(`[data-parameter="${parameter}"]`);
  const label = item?.querySelector<HTMLElement>('.recipe__range-label');
  const zone = item?.querySelector<HTMLElement>('.parameter-bar__zone');
  const fill = item?.querySelector<HTMLElement>('.parameter-bar__fill');

  if (!label || !zone || !fill) {
    return;
  }

  const bar = getBar(parameter);
  label.textContent = `${bar.label}: ${formatRange(range)}`;

  const zoneRange = expandRange(range, tolerance);
  const zoneStart = toPercent(zoneRange.min, bar);
  const zoneEnd = toPercent(zoneRange.max, bar);
  zone.style.left = `${zoneStart}%`;
  zone.style.width = `${Math.max(zoneEnd - zoneStart, 0)}%`;

  fill.style.left = `${toPercent(value, bar)}%`;
}

function clearBar(ranges: HTMLElement, parameter: IBarConfig['parameter']): void {
  const item = ranges.querySelector<HTMLElement>(`[data-parameter="${parameter}"]`);
  const label = item?.querySelector<HTMLElement>('.recipe__range-label');

  if (label) {
    label.textContent = '';
  }
}

export function renderRecipe(
  panel: IRecipePanel,
  recipe: IRecipe | null,
  cauldronValues: ICauldronValues,
  tolerance: number,
  cauldronCount: number,
  maxCauldronSize: number,
): void {
  if (!recipe) {
    panel.name.textContent = 'Press Start Game to get a recipe';
    panel.counter.textContent = '';
    panel.counter.classList.remove('recipe__counter--full');

    for (const parameter of PARAMETERS) {
      clearBar(panel.ranges, parameter);
    }

    return;
  }

  panel.name.textContent = recipe.name;

  for (const parameter of PARAMETERS) {
    updateBar(panel.ranges, parameter, recipe[parameter], tolerance, cauldronValues[parameter]);
  }

  const isFull = cauldronCount >= maxCauldronSize;
  panel.counter.textContent = `Ingredients: ${cauldronCount} / ${maxCauldronSize}`;
  panel.counter.classList.toggle('recipe__counter--full', isFull);
}
