export interface IGameScreen {
  root: HTMLElement;
  shelf: HTMLElement;
  cauldronSection: HTMLElement;
  cauldronList: HTMLElement;
  recipeName: HTMLElement;
  recipeRanges: HTMLElement;
  recipeCounter: HTMLElement;
  startButton: HTMLButtonElement;
  continueButton: HTMLButtonElement;
  leaderboardButton: HTMLButtonElement;
  helpButton: HTMLButtonElement;
  settingsButton: HTMLButtonElement;
  brewButton: HTMLButtonElement;
  pauseButton: HTMLButtonElement;
  statusScore: HTMLElement;
  statusLives: HTMLElement;
  timerWrapper: HTMLElement;
  timerLabel: HTMLElement;
  timerFill: HTMLElement;
  gameOver: HTMLElement;
  gameOverReason: HTMLElement;
  gameOverScore: HTMLElement;
  namePrompt: HTMLElement;
  nameInput: HTMLInputElement;
  nameError: HTMLElement;
  saveScoreButton: HTMLButtonElement;
  playAgainButton: HTMLButtonElement;
  viewLeaderboardButton: HTMLButtonElement;
  pauseDialog: HTMLElement;
  resumeButton: HTMLButtonElement;
  exitButton: HTMLButtonElement;
  leaderboardDialog: HTMLElement;
  leaderboardBody: HTMLElement;
  leaderboardEmpty: HTMLElement;
  clearLeaderboardButton: HTMLButtonElement;
  closeLeaderboardButton: HTMLButtonElement;
  clearConfirmDialog: HTMLElement;
  confirmClearButton: HTMLButtonElement;
  cancelClearButton: HTMLButtonElement;
  rulesDialog: HTMLElement;
  closeRulesButton: HTMLButtonElement;
  difficultyPanel: HTMLElement;
  easyButton: HTMLButtonElement;
  mediumButton: HTMLButtonElement;
  hardButton: HTMLButtonElement;
  closeDifficultyButton: HTMLButtonElement;
}

function getElement<T extends HTMLElement = HTMLElement>(root: HTMLElement, selector: string): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Game screen is missing "${selector}".`);
  }

  return element;
}

export function createGameScreen(): IGameScreen {
  const root = document.createElement('main');
  root.className = 'game';
  root.innerHTML = `
    <h1 class="game__title">Alchemist's Cauldron</h1>

    <section class="status" aria-label="Game status">
      <p class="status__score"></p>
      <div class="status__lives"></div>
      <div class="status__timer">
        <p class="status__timer-label"></p>
        <div class="status__timer-bar"><div class="status__timer-fill"></div></div>
      </div>
    </section>

    <section class="recipe" aria-labelledby="recipe-title">
      <h2 class="section-title" id="recipe-title">Recipe</h2>
      <p class="recipe__name"></p>
      <ul class="recipe__ranges"></ul>
      <p class="recipe__counter"></p>
      <div class="recipe__actions">
        <button type="button" class="button button--start">Start Game</button>
        <button type="button" class="button button--continue" hidden>Continue Game</button>
        <button type="button" class="button button--settings">Settings</button>
        <button type="button" class="button button--help">Help</button>
        <button type="button" class="button button--leaderboard">Leaderboard</button>
        <button type="button" class="button button--brew" hidden>Brew</button>
        <button type="button" class="button button--pause" hidden>Pause</button>
      </div>
    </section>

    <section class="shelf" aria-labelledby="shelf-title">
      <h2 class="section-title" id="shelf-title">Ingredient Shelf</h2>
      <div class="shelf__grid"></div>
    </section>

    <section class="cauldron" aria-labelledby="cauldron-title">
      <h2 class="section-title" id="cauldron-title">Cauldron</h2>
      <ol class="cauldron__list"></ol>
    </section>

    <div class="dialog game-over" hidden>
      <div class="dialog__card">
        <h2 class="dialog__title">Game Over</h2>
        <p class="game-over__reason"></p>
        <p class="game-over__score"></p>

        <div class="name-prompt">
          <label class="name-prompt__label" for="leaderboard-name-input">
            New Top-10 score! Enter your name:
          </label>
          <div class="name-prompt__row">
            <input
              type="text"
              id="leaderboard-name-input"
              class="name-prompt__input"
              minlength="2"
              maxlength="15"
              placeholder="Your name"
            />
            <button type="button" class="button button--save-score">Save</button>
          </div>
          <p class="name-prompt__error"></p>
        </div>

        <div class="dialog__actions">
          <button type="button" class="button button--play-again">Play again</button>
          <button type="button" class="button button--view-leaderboard">Leaderboard</button>
        </div>
      </div>
    </div>

    <div class="dialog pause" hidden>
      <div class="dialog__card">
        <h2 class="dialog__title">Paused</h2>
        <div class="dialog__actions">
          <button type="button" class="button button--resume">Resume</button>
          <button type="button" class="button button--exit">Exit to Menu</button>
        </div>
      </div>
    </div>

    <div class="dialog leaderboard" hidden>
      <div class="dialog__card dialog__card--wide">
        <h2 class="dialog__title">Leaderboard</h2>
        <p class="leaderboard__empty">No scores yet. Be the first!</p>
        <table class="leaderboard__table" aria-label="Top 10 leaderboard">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Score</th>
              <th scope="col">Date</th>
              <th scope="col">Difficulty</th>
            </tr>
          </thead>
          <tbody class="leaderboard__body"></tbody>
        </table>
        <div class="dialog__actions">
          <button type="button" class="button button--clear-leaderboard">Clear Leaderboard</button>
          <button type="button" class="button button--close-leaderboard">Close</button>
        </div>
      </div>
    </div>

    <div class="dialog clear-confirm" hidden>
      <div class="dialog__card">
        <h2 class="dialog__title">Clear Leaderboard?</h2>
        <p class="clear-confirm__text">This will permanently delete all saved scores.</p>
        <div class="dialog__actions">
          <button type="button" class="button button--confirm-clear">Yes, Clear</button>
          <button type="button" class="button button--cancel-clear">Cancel</button>
        </div>
      </div>
    </div>

    <div class="dialog rules" hidden>
      <div class="dialog__card dialog__card--wide">
        <h2 class="dialog__title">How to Play</h2>
        <div class="rules__text">
          <p>
            Mix ingredients from the shelf into the cauldron to bring Temperature, Density and
            Magic Power into the active recipe's ranges, then click Brew.
          </p>
          <p>A correct brew scores points and adds a time bonus. A wrong brew costs one life.</p>
          <p>
            The game ends when the time runs out, you run out of lives, or you run out of
            ingredients.
          </p>
          <p>
            Difficulty (Easy / Medium / Hard) changes the shelf size, cauldron limit, time,
            tolerance, lives and score per brew. Pick it from Settings before starting.
          </p>
          <p>
            Pause freezes the timer; the game also pauses automatically when you switch tabs.
          </p>
          <p>Your best 10 scores per difficulty are saved on this device.</p>
        </div>
        <div class="dialog__actions">
          <button type="button" class="button button--close-rules">Close</button>
        </div>
      </div>
    </div>

    <div class="dialog difficulty-panel" hidden>
      <div class="dialog__card dialog__card--wide">
        <h2 class="dialog__title">Choose Difficulty</h2>
        <div class="difficulty-panel__list">
          <button type="button" class="button difficulty-button button--difficulty-easy"></button>
          <button
            type="button"
            class="button difficulty-button button--difficulty-medium"
          ></button>
          <button type="button" class="button difficulty-button button--difficulty-hard"></button>
        </div>
        <div class="dialog__actions">
          <button type="button" class="button button--close-difficulty">Close</button>
        </div>
      </div>
    </div>
  `;

  return {
    root,
    shelf: getElement(root, '.shelf__grid'),
    cauldronSection: getElement(root, '.cauldron'),
    cauldronList: getElement(root, '.cauldron__list'),
    recipeName: getElement(root, '.recipe__name'),
    recipeRanges: getElement(root, '.recipe__ranges'),
    recipeCounter: getElement(root, '.recipe__counter'),
    startButton: getElement<HTMLButtonElement>(root, '.button--start'),
    continueButton: getElement<HTMLButtonElement>(root, '.button--continue'),
    leaderboardButton: getElement<HTMLButtonElement>(root, '.button--leaderboard'),
    helpButton: getElement<HTMLButtonElement>(root, '.button--help'),
    settingsButton: getElement<HTMLButtonElement>(root, '.button--settings'),
    brewButton: getElement<HTMLButtonElement>(root, '.button--brew'),
    pauseButton: getElement<HTMLButtonElement>(root, '.button--pause'),
    statusScore: getElement(root, '.status__score'),
    statusLives: getElement(root, '.status__lives'),
    timerWrapper: getElement(root, '.status__timer'),
    timerLabel: getElement(root, '.status__timer-label'),
    timerFill: getElement(root, '.status__timer-fill'),
    gameOver: getElement(root, '.game-over'),
    gameOverReason: getElement(root, '.game-over__reason'),
    gameOverScore: getElement(root, '.game-over__score'),
    namePrompt: getElement(root, '.name-prompt'),
    nameInput: getElement<HTMLInputElement>(root, '.name-prompt__input'),
    nameError: getElement(root, '.name-prompt__error'),
    saveScoreButton: getElement<HTMLButtonElement>(root, '.button--save-score'),
    playAgainButton: getElement<HTMLButtonElement>(root, '.button--play-again'),
    viewLeaderboardButton: getElement<HTMLButtonElement>(root, '.button--view-leaderboard'),
    pauseDialog: getElement(root, '.pause'),
    resumeButton: getElement<HTMLButtonElement>(root, '.button--resume'),
    exitButton: getElement<HTMLButtonElement>(root, '.button--exit'),
    leaderboardDialog: getElement(root, '.leaderboard'),
    leaderboardBody: getElement(root, '.leaderboard__body'),
    leaderboardEmpty: getElement(root, '.leaderboard__empty'),
    clearLeaderboardButton: getElement<HTMLButtonElement>(root, '.button--clear-leaderboard'),
    closeLeaderboardButton: getElement<HTMLButtonElement>(root, '.button--close-leaderboard'),
    clearConfirmDialog: getElement(root, '.clear-confirm'),
    confirmClearButton: getElement<HTMLButtonElement>(root, '.button--confirm-clear'),
    cancelClearButton: getElement<HTMLButtonElement>(root, '.button--cancel-clear'),
    rulesDialog: getElement(root, '.rules'),
    closeRulesButton: getElement<HTMLButtonElement>(root, '.button--close-rules'),
    difficultyPanel: getElement(root, '.difficulty-panel'),
    easyButton: getElement<HTMLButtonElement>(root, '.button--difficulty-easy'),
    mediumButton: getElement<HTMLButtonElement>(root, '.button--difficulty-medium'),
    hardButton: getElement<HTMLButtonElement>(root, '.button--difficulty-hard'),
    closeDifficultyButton: getElement<HTMLButtonElement>(root, '.button--close-difficulty'),
  };
}
