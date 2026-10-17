import './styles/style.css';
import { isCauldronFull } from './logic/cauldron';
import {
  addIngredient,
  brew,
  canBrew,
  exitToMenu,
  gameState,
  getSettings,
  getShelfIngredients,
  pauseGame,
  resumeGame,
  startNewGame,
  tick,
} from './state/game-state';
import { renderCauldron } from './ui/cauldron';
import { renderGameOver } from './ui/game-over';
import { createGameScreen, type IGameScreen } from './ui/game-screen';
import { renderPauseScreen } from './ui/pause';
import { renderRecipe } from './ui/recipe';
import { renderShelf } from './ui/shelf';
import { renderStatusBar } from './ui/status-bar';

// How often the timer is recalculated and the screen is redrawn. The actual
// time left always comes from timestamps (see state/game-state.ts), so this
// interval only decides how smooth the countdown looks, not its accuracy.
const TICK_INTERVAL_MS = 250;

function render(screen: IGameScreen): void {
  const settings = getSettings();
  const isMenu = gameState.status === 'menu';
  const isPlaying = gameState.status === 'playing';
  const isPaused = gameState.status === 'paused';
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
  renderPauseScreen({ container: screen.pauseDialog }, isPaused);

  // Blurs the recipe/shelf/cauldron while paused, so the player cannot plan
  // moves (see .game--paused in style.css).
  screen.root.classList.toggle('game--paused', isPaused);

  screen.startButton.hidden = !isMenu;
  screen.brewButton.hidden = !isPlaying;
  screen.brewButton.disabled = !canBrew();
  screen.pauseButton.hidden = !isPlaying;
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
  screen.pauseButton.addEventListener('click', () => {
    pauseGame();
    render(screen);
  });
  screen.resumeButton.addEventListener('click', () => {
    resumeGame();
    render(screen);
  });
  screen.exitButton.addEventListener('click', () => {
    exitToMenu();
    render(screen);
  });

  // Pause automatically whenever the tab is sent to the background.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseGame();
      render(screen);
    }
  });

  setInterval(() => {
    tick();
    render(screen);
  }, TICK_INTERVAL_MS);

  render(screen);
}

startApp();
