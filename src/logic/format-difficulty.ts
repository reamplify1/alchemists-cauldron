import type { IDifficultySettings } from '../data/difficulty';
import type { Difficulty } from '../types/game';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function formatDifficultyButtonLabel(
  difficulty: Difficulty,
  settings: IDifficultySettings,
): string {
  return (
    `${DIFFICULTY_LABELS[difficulty]} — ${settings.shelfSize} ingredients, ` +
    `${settings.startingTimeSeconds}s, ${settings.lives} lives`
  );
}
