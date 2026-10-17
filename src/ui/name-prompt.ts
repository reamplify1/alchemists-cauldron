export interface INamePrompt {
  container: HTMLElement;
  error: HTMLElement;
}

// Shown inside the Game Over dialog only while the final score still
// qualifies for the Top 10 and has not been saved yet.
export function renderNamePrompt(
  prompt: INamePrompt,
  isVisible: boolean,
  errorMessage: string,
): void {
  prompt.container.hidden = !isVisible;
  prompt.error.textContent = isVisible ? errorMessage : '';
}
