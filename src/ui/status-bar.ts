import { formatTime } from '../logic/format-time';

export interface IStatusBar {
  score: HTMLElement;
  lives: HTMLElement;
  timerWrapper: HTMLElement;
  timerLabel: HTMLElement;
  timerFill: HTMLElement;
}

// Below this many seconds, the timer turns red and pulses (see style.css).
const LOW_TIME_THRESHOLD_SECONDS = 15;

// One filled heart per remaining life, one empty heart per life already
// lost, out of the total lives for the current difficulty.
function renderLives(container: HTMLElement, lives: number, maxLives: number): void {
  const hearts: HTMLSpanElement[] = [];

  for (let index = 0; index < maxLives; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'status__life';
    heart.textContent = index < lives ? '♥' : '♡';
    hearts.push(heart);
  }

  container.replaceChildren(...hearts);
}

export function renderStatusBar(
  statusBar: IStatusBar,
  score: number,
  lives: number,
  maxLives: number,
  timeLeft: number,
  startingTimeSeconds: number,
): void {
  statusBar.score.textContent = `Score: ${score}`;
  renderLives(statusBar.lives, lives, maxLives);

  statusBar.timerLabel.textContent = formatTime(timeLeft);

  const percentage = startingTimeSeconds > 0 ? (timeLeft / startingTimeSeconds) * 100 : 0;
  statusBar.timerFill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;

  statusBar.timerWrapper.classList.toggle(
    'status__timer--low',
    timeLeft < LOW_TIME_THRESHOLD_SECONDS,
  );
}
