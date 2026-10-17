export interface IPauseScreen {
  container: HTMLElement;
}

// Reuses the same dialog layout as the Game Over screen (see style.css).
export function renderPauseScreen(screen: IPauseScreen, isPaused: boolean): void {
  screen.container.hidden = !isPaused;
}
