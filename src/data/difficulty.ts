import type { Difficulty } from '../types/game';

export interface IDifficultySettings {
  shelfSize: number;
  maxCauldronSize: number;
  startingTimeSeconds: number;
  tolerance: number;
  lives: number;
  scorePerBrew: number;
  timeBonusSeconds: number;
  reactionCount: number;
}

// The difficulty table from the README — the single source of these numbers.
export const DIFFICULTY_SETTINGS: Record<Difficulty, IDifficultySettings> = {
  easy: {
    shelfSize: 4,
    maxCauldronSize: 4,
    startingTimeSeconds: 180,
    tolerance: 12,
    lives: 5,
    scorePerBrew: 100,
    timeBonusSeconds: 15,
    reactionCount: 0,
  },
  medium: {
    shelfSize: 6,
    maxCauldronSize: 4,
    startingTimeSeconds: 150,
    tolerance: 8,
    lives: 3,
    scorePerBrew: 200,
    timeBonusSeconds: 10,
    reactionCount: 2,
  },
  hard: {
    shelfSize: 8,
    maxCauldronSize: 5,
    startingTimeSeconds: 150,
    tolerance: 5,
    lives: 3,
    scorePerBrew: 300,
    timeBonusSeconds: 5,
    reactionCount: 3,
  },
};

// Level 1 always plays with the Medium rules.
export const LEVEL_1_DIFFICULTY: Difficulty = 'medium';

// Stock range for every ingredient at the start of a new game (all difficulties).
export const MIN_STOCK = 2;
export const MAX_STOCK = 15;
