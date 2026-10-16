import type { IIngredient } from '../types/game';

// The full ordered catalogue from the README. Level 1 uses the first 6
// ingredients; Level 2 Hard uses all 8, so the whole list stays here.
export const INGREDIENTS: IIngredient[] = [
  {
    id: 'dragon-tears',
    name: 'Dragon Tears',
    icon: 'flame',
    temperature: 25,
    density: 8,
    magicPower: 10,
  },
  {
    id: 'fairy-dust',
    name: 'Fairy Dust',
    icon: 'sparkle',
    temperature: 12,
    density: 9,
    magicPower: 12,
  },
  {
    id: 'frost-lotus',
    name: 'Frost Lotus',
    icon: 'snowflake',
    temperature: -18,
    density: 4,
    magicPower: 14,
  },
  {
    id: 'mandrake-root',
    name: 'Mandrake Root',
    icon: 'root',
    temperature: -5,
    density: 20,
    magicPower: 8,
  },
  {
    id: 'caustic-acid',
    name: 'Caustic Acid',
    icon: 'drop',
    temperature: 10,
    density: 14,
    magicPower: 22,
  },
  {
    id: 'essence-of-the-void',
    name: 'Essence of the Void',
    icon: 'void',
    temperature: -20,
    density: -10,
    magicPower: 40,
  },
  {
    id: 'phoenix-feather',
    name: 'Phoenix Feather',
    icon: 'feather',
    temperature: 50,
    density: -10,
    magicPower: 30,
  },
  {
    id: 'toad-slime',
    name: 'Toad Slime',
    icon: 'slime',
    temperature: 5,
    density: 30,
    magicPower: 0,
  },
];
