import './styles/style.css';
import { isCauldronFull } from './logic/cauldron';
import { sortLeaderboard } from './logic/leaderboard';
import {
  addIngredient,
  brew,
  canBrew,
  canSaveScore,
  continueGame,
  exitToMenu,
  gameState,
  getDifficulty,
  getSettings,
  getShelfIngredients,
  hasContinuableSave,
  pauseGame,
  resumeGame,
  saveScore,
  setDifficulty,
  startNewGame,
  tick,
} from './state/game-state';
import { clearLeaderboard, loadLeaderboard } from './storage/leaderboard';
import { renderCauldron, setCauldronDropHighlight } from './ui/cauldron';
import { renderDifficultyPanel } from './ui/difficulty-panel';
import { renderGameOver } from './ui/game-over';
import { createGameScreen, type IGameScreen } from './ui/game-screen';
import { renderLeaderboard } from './ui/leaderboard';
import { renderNamePrompt } from './ui/name-prompt';
import { renderPauseScreen } from './ui/pause';
import { renderRecipe } from './ui/recipe';
import { renderShelf } from './ui/shelf';
import { renderStatusBar } from './ui/status-bar';

// How often the timer is recalculated and the screen is redrawn. The actual
// time left always comes from timestamps (see state/game-state.ts), so this
// interval only decides how smooth the countdown looks, not its accuracy.
const TICK_INTERVAL_MS = 250;

// Validation message shown under the name input. This is transient UI
// state, not a game rule, so it lives here rather than in game-state.ts.
let nameErrorMessage = '';

// Whether the Leaderboard / Clear Leaderboard confirmation overlays are
// open. Also UI-only state: it has no effect on the game itself.
let isLeaderboardOpen = false;
let isClearConfirmOpen = false;
let isRulesOpen = false;
let isDifficultyPanelOpen = false;

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
  renderNamePrompt(
    { container: screen.namePrompt, error: screen.nameError },
    canSaveScore(),
    nameErrorMessage,
  );
  renderPauseScreen({ container: screen.pauseDialog }, isPaused);
  renderLeaderboard(
    {
      container: screen.leaderboardDialog,
      body: screen.leaderboardBody,
      empty: screen.leaderboardEmpty,
    },
    isLeaderboardOpen,
    sortLeaderboard(loadLeaderboard(getDifficulty())),
    getDifficulty(),
  );
  screen.clearConfirmDialog.hidden = !isClearConfirmOpen;
  screen.rulesDialog.hidden = !isRulesOpen;
  renderDifficultyPanel(
    {
      container: screen.difficultyPanel,
      easyButton: screen.easyButton,
      mediumButton: screen.mediumButton,
      hardButton: screen.hardButton,
    },
    isDifficultyPanelOpen,
    getDifficulty(),
  );

  // Blurs the recipe/shelf/cauldron while paused, so the player cannot plan
  // moves (see .game--paused in style.css).
  screen.root.classList.toggle('game--paused', isPaused);

  screen.startButton.hidden = !isMenu;
  // Only offered on the start screen, and only while a valid unfinished
  // save actually exists (hasContinuableSave reads localStorage, so it is
  // skipped outside the menu thanks to the short-circuit here).
  screen.continueButton.hidden = !(isMenu && hasContinuableSave());
  screen.leaderboardButton.hidden = !isMenu;
  screen.helpButton.hidden = !isMenu;
  screen.settingsButton.hidden = !isMenu;
  // No life icons on the start screen (see US 2.1).
  screen.statusLives.hidden = isMenu;
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

// Puts the dragged ingredient's id into the drag data, same id the click
// flow already uses. Cards with no stock (or a blocked shelf) are not
// draggable at all (see ui/shelf.ts), so there is nothing to guard here.
function handleShelfDragStart(event: DragEvent): void {
  if (!(event.target instanceof Element) || !event.dataTransfer) {
    return;
  }

  const card = event.target.closest<HTMLButtonElement>('[data-ingredient-id]');
  const ingredientId = card?.dataset.ingredientId;

  if (!ingredientId) {
    return;
  }

  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('text/plain', ingredientId);
}

// A drop is rejected by default unless dragover calls preventDefault(), so
// this is what makes the cauldron a valid drop target in the first place.
function handleCauldronDragOver(event: DragEvent, screen: IGameScreen): void {
  event.preventDefault();
  setCauldronDropHighlight(screen.cauldronSection, true);
}

function handleCauldronDragLeave(screen: IGameScreen): void {
  setCauldronDropHighlight(screen.cauldronSection, false);
}

// Reuses the exact same addIngredient() call as a click, so a drop follows
// the same rules for free: ignored while paused (status isn't "playing"),
// ignored when the cauldron is full, ignored when stock is 0.
function handleCauldronDrop(event: DragEvent, screen: IGameScreen): void {
  event.preventDefault();
  setCauldronDropHighlight(screen.cauldronSection, false);

  const ingredientId = event.dataTransfer?.getData('text/plain');

  if (ingredientId && addIngredient(ingredientId)) {
    render(screen);
  }
}

function handleStartClick(screen: IGameScreen): void {
  startNewGame();
  nameErrorMessage = '';
  render(screen);
}

function handleBrewClick(screen: IGameScreen): void {
  brew();
  render(screen);
}

function handleSaveScoreClick(screen: IGameScreen): void {
  if (saveScore(screen.nameInput.value)) {
    screen.nameInput.value = '';
    nameErrorMessage = '';
  } else {
    nameErrorMessage = 'Enter a name of 2-15 characters: letters, digits, spaces, _ or -.';
  }

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
  screen.shelf.addEventListener('dragstart', (event) => {
    handleShelfDragStart(event);
  });
  screen.cauldronSection.addEventListener('dragover', (event) => {
    handleCauldronDragOver(event, screen);
  });
  screen.cauldronSection.addEventListener('dragleave', () => {
    handleCauldronDragLeave(screen);
  });
  screen.cauldronSection.addEventListener('drop', (event) => {
    handleCauldronDrop(event, screen);
  });
  screen.startButton.addEventListener('click', () => {
    handleStartClick(screen);
  });
  screen.continueButton.addEventListener('click', () => {
    if (continueGame()) {
      nameErrorMessage = '';
      render(screen);
    }
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

  screen.saveScoreButton.addEventListener('click', () => {
    handleSaveScoreClick(screen);
  });
  screen.nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleSaveScoreClick(screen);
    }
  });

  screen.leaderboardButton.addEventListener('click', () => {
    isLeaderboardOpen = true;
    render(screen);
  });
  screen.viewLeaderboardButton.addEventListener('click', () => {
    isLeaderboardOpen = true;
    render(screen);
  });
  screen.closeLeaderboardButton.addEventListener('click', () => {
    isLeaderboardOpen = false;
    isClearConfirmOpen = false;
    render(screen);
  });
  screen.clearLeaderboardButton.addEventListener('click', () => {
    isClearConfirmOpen = true;
    render(screen);
  });
  screen.cancelClearButton.addEventListener('click', () => {
    isClearConfirmOpen = false;
    render(screen);
  });
  screen.confirmClearButton.addEventListener('click', () => {
    clearLeaderboard(getDifficulty());
    isClearConfirmOpen = false;
    render(screen);
  });

  screen.helpButton.addEventListener('click', () => {
    isRulesOpen = true;
    render(screen);
  });
  screen.closeRulesButton.addEventListener('click', () => {
    isRulesOpen = false;
    render(screen);
  });

  screen.settingsButton.addEventListener('click', () => {
    isDifficultyPanelOpen = true;
    render(screen);
  });
  screen.closeDifficultyButton.addEventListener('click', () => {
    isDifficultyPanelOpen = false;
    render(screen);
  });
  screen.easyButton.addEventListener('click', () => {
    setDifficulty('easy');
    render(screen);
  });
  screen.mediumButton.addEventListener('click', () => {
    setDifficulty('medium');
    render(screen);
  });
  screen.hardButton.addEventListener('click', () => {
    setDifficulty('hard');
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
