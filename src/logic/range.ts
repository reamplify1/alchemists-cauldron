import type { IRecipeRange } from '../types/game';

// Both ends are included: 32..42 accepts 32 and 42.
export function isInRange(value: number, range: IRecipeRange): boolean {
  return value >= range.min && value <= range.max;
}
