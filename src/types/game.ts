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

// One saved leaderboard entry (see storage/leaderboard.ts).
export interface ILeaderboardEntry {
  id: string;
  name: string;
  score: number;
  // Date.now() timestamp of when the entry was saved.
  date: number;
}

// The auto-saved unfinished game (see storage/save-game.ts). Only a
// "playing" or "paused" game is ever saved or offered as Continue Game.
export interface ISavedGame {
  difficulty: Difficulty;
  score: number;
  timeLeft: number;
  lives: number;
  activeRecipe: IRecipe | null;
  cauldronIngredients: IIngredient[];
  shelfStock: Record<string, number>;
  status: Extract<GameStatus, 'playing' | 'paused'>;
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
  // True once the current run's score has been saved to the leaderboard,
  // so the name prompt is not shown twice for the same game over.
  scoreSaved: boolean;
  // Level 2+
  difficulty?: Difficulty;
  // Level 3+
  lastReactionId?: string | null;
}

export interface IReaction {
  id: string;
  name: string;
  // The lowest difficulty this reaction is active on: 'medium' reactions
  // also run on Hard, 'hard' reactions only run on Hard (see US 3.3).
  difficulty: Exclude<Difficulty, 'easy'>;
  // Whether this reaction's combination is currently present in the
  // cauldron. Checked against the raw ingredient list, not the computed
  // values, so a stat-threshold reaction recomputes its own totals.
  isActive: (ingredients: IIngredient[]) => boolean;
  // The reaction's effect on the cauldron's current values. Reapplied fresh
  // every time the values are needed, for as long as isActive() stays true
  // — this is not a one-time change.
  apply: (values: ICauldronValues) => ICauldronValues;
  // One-time side effects, applied only once: the moment the reaction turns
  // from inactive to active (not reapplied while it stays active, and not
  // part of apply() above). All optional — most reactions only need apply().
  timeDeltaSeconds?: number;
  livesDelta?: number;
  clearsCauldron?: boolean;
}
