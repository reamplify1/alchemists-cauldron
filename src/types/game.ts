export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'game-over';

// Why the game ended, shown on the Game Over screen.
export type GameOverReason = 'time' | 'lives' | 'ingredients';

export interface IIngredient {
  id: string;
  name: string;
  icon: string;
  temperature: number;
  density: number;
  magicPower: number;
}

export interface IRecipeRange {
  min: number;
  max: number;
}

export interface IRecipe {
  id: string;
  name: string;
  difficulty: Difficulty;
  temperature: IRecipeRange;
  density: IRecipeRange;
  magicPower: IRecipeRange;
}

export interface ICauldronValues {
  temperature: number;
  density: number;
  magicPower: number;
}

export interface IGameState {
  status: GameStatus;
  score: number;
  timeLeft: number;
  lives: number;
  // No recipe before the first run (start screen).
  activeRecipe: IRecipe | null;
  cauldronIngredients: IIngredient[];
  // Ingredient id -> portions left on the shelf.
  shelfStock: Record<string, number>;
  // Set only while status is "game-over".
  gameOverReason?: GameOverReason;
  // Level 2+
  difficulty?: Difficulty;
  // Level 3+
  lastReactionId?: string | null;
}

export interface IReaction {
  id: string;
  name: string;
  difficulty: Exclude<Difficulty, 'easy'>;
  isActive: (ingredients: IIngredient[]) => boolean;
  apply: (values: ICauldronValues) => ICauldronValues;
}
