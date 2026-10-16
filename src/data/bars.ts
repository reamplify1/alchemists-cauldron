import type { ICauldronValues } from '../types/game';

export interface IBarConfig {
  parameter: keyof ICauldronValues;
  label: string;
  min: number;
  max: number;
}

// The visible range of every bar. Temperature and Density can go below 0, so
// their scale is symmetric and the center line means 0. Magic Power is never
// negative, so its bar starts at 0. Values outside the range stick to the edge.
export const BARS: IBarConfig[] = [
  { parameter: 'temperature', label: 'Temperature', min: -100, max: 100 },
  { parameter: 'density', label: 'Density', min: -100, max: 100 },
  { parameter: 'magicPower', label: 'Magic Power', min: 0, max: 200 },
];
