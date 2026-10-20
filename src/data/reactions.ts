import { calculateCauldron } from '../logic/calculate-cauldron';
import type { ICauldronValues, IIngredient, IReaction } from '../types/game';

// True when both ingredient ids are present anywhere in the cauldron,
// regardless of order, amount or what else is mixed in with them.
function hasPair(ingredients: IIngredient[], firstId: string, secondId: string): boolean {
  const ids = new Set(ingredients.map((ingredient) => ingredient.id));
  return ids.has(firstId) && ids.has(secondId);
}

// The reaction table from US 3.3. Medium plays with the first two entries;
// Hard adds the third on top (see logic/reactions.ts for how difficulty
// picks the active subset). These three were picked to cover every kind of
// effect the full table describes: a value boost with a one-time time cost
// (Bubbling), a pure stat-threshold boost with no one-time cost (Pressure
// Spike), and a punishing ingredient pair with a one-time life cost and a
// cauldron clear (Volatile Mix — it also needs Phoenix Feather, which only
// ever appears on the Hard shelf, so it could never fire on Medium anyway).
export const REACTIONS: IReaction[] = [
  {
    id: 'bubbling',
    name: 'Bubbling',
    difficulty: 'medium',
    isActive: (ingredients: IIngredient[]): boolean =>
      hasPair(ingredients, 'fairy-dust', 'caustic-acid'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      magicPower: values.magicPower * 1.5,
    }),
    timeDeltaSeconds: -10,
  },
  {
    id: 'pressure-spike',
    name: 'Pressure Spike',
    difficulty: 'medium',
    isActive: (ingredients: IIngredient[]): boolean => calculateCauldron(ingredients).density >= 70,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: 70,
      magicPower: values.magicPower * 1.1,
    }),
  },
  {
    id: 'volatile-mix',
    name: 'Volatile Mix',
    difficulty: 'hard',
    isActive: (ingredients: IIngredient[]): boolean =>
      hasPair(ingredients, 'phoenix-feather', 'essence-of-the-void'),
    apply: (values: ICauldronValues): ICauldronValues => values,
    livesDelta: -1,
    clearsCauldron: true,
  },
];
