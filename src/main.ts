import './styles/style.css';
import { isCauldronFull } from './logic/cauldron';
import {
  addIngredient,
  brew,
  canBrew,
  gameState,
  getSettings,
  getShelfIngredients,
  startNewGame,
  tick,
} from './state/game-state';
import { renderCauldron } from './ui/cauldron';
import { renderGameOver } from './ui/game-over';
import { createGameScreen, type IGameScreen } from './ui/game-screen';
import { renderRecipe } from './ui/recipe';
import { renderShelf } from './ui/shelf';
import { renderStatusBar } from './ui/status-bar';

// How often the timer is recalculated and the screen is redrawn. The actual
// time left always comes from timestamps (see state/game-state.ts), so this
// interval only decides how smooth the countdown looks, not its accuracy.
const TICK_INTERVAL_MS = 250;

function render(screen: IGameScreen): void {
  const settings = getSettings();
  const isPlaying = gameState.status === 'playing';
  const isGameOver = gameState.status === 'game-over';

  renderShelf(
    screen.shelf,
    getShelfIngredients(),
    gameState.shelfStock,
    isCauldronFull(gameState.cauldronIngredients, settings.maxCauldronSize),
  );
  renderCauldron(screen.cauldronList, gameState.cauldronIngredients);
  renderRecipe(
    {
      name: screen.recipeName,
      ranges: screen.recipeRanges,
      counter: screen.recipeCounter,
    },
    gameState.activeRecipe,
    gameState.cauldronIngredients.length,
    settings.maxCauldronSize,
  );
  renderStatusBar(
    {
      score: screen.statusScore,
      lives: screen.statusLives,
      timerWrapper: screen.timerWrapper,
      timerLabel: screen.timerLabel,
      timerFill: screen.timerFill,
    },
    gameState.score,
    gameState.lives,
    settings.lives,
    gameState.timeLeft,
    settings.startingTimeSeconds,
  );
  renderGameOver(
    {
      container: screen.gameOver,
      reason: screen.gameOverReason,
      score: screen.gameOverScore,
    },
    isGameOver,
    gameState.gameOverReason,
    gameState.score,
  );

  // Before the first run, show Start Game in the center instead of Brew.
  // Once a game has finished, the Game Over screen offers Play again instead.
  screen.startButton.hidden = isPlaying || isGameOver;
  screen.brewButton.hidden = !isPlaying;
  screen.brewButton.disabled = !canBrew();
}

function handleShelfClick(event: MouseEvent, screen: IGameScreen): void {
  if (!(event.target instanceof Element)) {
    return;
  }

  const card = event.target.closest<HTMLButtonElement>('[data-ingredient-id]');
  const ingredientId = card?.dataset.ingredientId;

  if (ingredientId && addIngredient(ingredientId)) {
    render(screen);
  }
}

function handleStartClick(screen: IGameScreen): void {
  startNewGame();
  render(screen);
}

function handleBrewClick(screen: IGameScreen): void {
  brew();
  render(screen);
}

function startApp(): void {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    return;
  }

  const screen = createGameScreen();
  app.replaceChildren(screen.root);

  screen.shelf.addEventListener('click', (event) => {
    handleShelfClick(event, screen);
  });
  screen.startButton.addEventListener('click', () => {
    handleStartClick(screen);
  });
  screen.brewButton.addEventListener('click', () => {
    handleBrewClick(screen);
  });
  screen.playAgainButton.addEventListener('click', () => {
    handleStartClick(screen);
  });

  setInterval(() => {
    tick();
    render(screen);
  }, TICK_INTERVAL_MS);

  render(screen);
}

startApp();
