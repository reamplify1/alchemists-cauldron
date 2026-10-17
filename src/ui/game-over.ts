import type { GameOverReason } from '../types/game';

export interface IGameOverScreen {
  container: HTMLElement;
  reason: HTMLElement;
  score: HTMLElement;
}

const REASON_TEXT: Record<GameOverReason, string> = {
  time: "Time's up!",
  lives: 'Out of lives!',
  ingredients: 'Out of ingredients!',
};

// Kept separate from the main game field: a single overlay that only shows
// up once the game is over, with the reason and the final score.
export function renderGameOver(
  screen: IGameOverScreen,
  isGameOver: boolean,
  reason: GameOverReason | undefined,
  score: number,
): void {
  screen.container.hidden = !isGameOver;

  if (!isGameOver) {
    return;
  }

  screen.reason.textContent = reason ? REASON_TEXT[reason] : '';
  screen.score.textContent = `Final score: ${score}`;
}
