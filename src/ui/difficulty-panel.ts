import { DIFFICULTY_SETTINGS } from '../data/difficulty';
import { formatDifficultyButtonLabel } from '../logic/format-difficulty';
import type { Difficulty } from '../types/game';

export interface IDifficultyPanel {
  container: HTMLElement;
  easyButton: HTMLButtonElement;
  mediumButton: HTMLButtonElement;
  hardButton: HTMLButtonElement;
}

function renderButton(
  button: HTMLButtonElement,
  difficulty: Difficulty,
  selectedDifficulty: Difficulty,
): void {
  const isSelected = difficulty === selectedDifficulty;
  const label = formatDifficultyButtonLabel(difficulty, DIFFICULTY_SETTINGS[difficulty]);
  button.textContent = isSelected ? `✓ ${label}` : label;
  button.classList.toggle('difficulty-button--selected', isSelected);
}

export function renderDifficultyPanel(
  panel: IDifficultyPanel,
  isOpen: boolean,
  selectedDifficulty: Difficulty,
): void {
  panel.container.hidden = !isOpen;

  if (!isOpen) {
    return;
  }

  renderButton(panel.easyButton, 'easy', selectedDifficulty);
  renderButton(panel.mediumButton, 'medium', selectedDifficulty);
  renderButton(panel.hardButton, 'hard', selectedDifficulty);
}
