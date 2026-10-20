import './styles/style.css';
import { isCauldronFull } from './logic/cauldron';
import { sortLeaderboard } from './logic/leaderboard';
import {
  addIngredient,
  brew,
  canBrew,
  canPourOut,
  canSaveScore,
  continueGame,
  exitToMenu,
  gameState,
  getCauldronValues,
  getDifficulty,
  getSettings,
  getShelfIngredients,
  hasContinuableSave,
  pauseGame,
  pourOut,
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
    getCauldronValues(),
    settings.tolerance,
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
  screen.pourOutButton.hidden = !isPlaying;
  screen.pourOutButton.disabled = !canPourOut();
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

// Restarts a one-shot CSS animation class, even if it is already playing
// from a moment ago, by forcing the browser to notice the class was
// removed before adding it back (see US 3.5). The class removes itself
// once its animation finishes, via a one-time 'animationend' listener —
// no setInterval/setTimeout involved, and the animation's timing itself
// lives entirely in style.css.
function triggerAnimation(element: HTMLElement, className: string): void {
  element.classList.remove(className);
  // Reading offsetWidth forces the browser to apply the removal above
  // before the class is added back on the next line, so the animation
  // restarts even if it was still running.
  void element.offsetWidth;
  element.classList.add(className);

  element.addEventListener(
    'animationend',
    () => {
      element.classList.remove(className);
    },
    { once: true },
  );
}

function handleBrewClick(screen: IGameScreen): void {
  const success = brew();
  triggerAnimation(screen.cauldronSection, success ? 'cauldron--success' : 'cauldron--fail');

  if (!success) {
    triggerAnimation(screen.root, 'game--shake');
  }

  render(screen);
}

function handlePourOutClick(screen: IGameScreen): void {
  pourOut();
  render(screen);
}

function handlePauseClick(screen: IGameScreen): void {
  pauseGame();
  render(screen);
}

// Mirrors the Brew button's own disabled check (see render()), so pressing
// the shortcut with an empty cauldron does nothing instead of triggering a
// misleading "failed brew" animation for a brew that never happened.
function handleBrewShortcut(screen: IGameScreen): void {
  if (canBrew()) {
    handleBrewClick(screen);
  }
}

// Mirrors the Pour Out button's own disabled check, for the same reason.
function handlePourOutShortcut(screen: IGameScreen): void {
  if (canPourOut()) {
    handlePourOutClick(screen);
  }
}

// True while the keyboard event's target is a text input, a textarea, or
// any other editable element — typing a leaderboard name must never be
// hijacked by a game shortcut (see US 3.6).
function isTypingInField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

// US 3.6: keyboard shortcuts for the active game flow. Kept small and
// explicit on purpose (hint 3), and deliberately does not map Enter or
// Space — those already work on whichever real button is focused, the
// normal browser way (hint 4), so this map only adds extra shortcuts on
// top of that, it never replaces it.
const KEY_ACTIONS: Record<string, (screen: IGameScreen) => void> = {
  b: handleBrewShortcut,
  o: handlePourOutShortcut,
  p: handlePauseClick,
  Escape: handlePauseClick,
};

// The single keyboard handler for the whole game, gated by the current
// game state (hint: keep it in one place). Shortcuts only ever run while a
// run is actually in progress — the start screen, the pause dialog and the
// Game Over screen all fall through here with their normal browser
// keyboard behavior untouched, exactly like a menu/paused/game-over return
// would (hints 1-2).
function handleGameKeyDown(event: KeyboardEvent, screen: IGameScreen): void {
  if (gameState.status !== 'playing') {
    return;
  }

  if (isTypingInField(event.target) || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  // Shift+B arrives as "B", not "b" — normalize single-character keys so
  // the small key map above only has to list the lowercase letter once.
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const action = KEY_ACTIONS[key];
  action?.(screen);
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
  screen.pourOutButton.addEventListener('click', () => {
    handlePourOutClick(screen);
  });
  screen.playAgainButton.addEventListener('click', () => {
    handleStartClick(screen);
  });
  screen.pauseButton.addEventListener('click', () => {
    handlePauseClick(screen);
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

  // US 3.6: the one keyboard handler for the whole game (see
  // handleGameKeyDown for why it is safe to attach this globally instead
  // of only while playing).
  document.addEventListener('keydown', (event) => {
    handleGameKeyDown(event, screen);
  });

  setInterval(() => {
    tick();
    render(screen);
  }, TICK_INTERVAL_MS);

  render(screen);
}

startApp();
