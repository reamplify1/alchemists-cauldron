export interface IGameScreen {
  root: HTMLElement;
  shelf: HTMLElement;
  cauldronList: HTMLElement;
  recipeName: HTMLElement;
  recipeRanges: HTMLElement;
  recipeCounter: HTMLElement;
  startButton: HTMLButtonElement;
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
  playAgainButton: HTMLButtonElement;
  pauseDialog: HTMLElement;
  resumeButton: HTMLButtonElement;
  exitButton: HTMLButtonElement;
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
        <button type="button" class="button button--play-again">Play again</button>
      </div>
    </div>

    <div class="dialog pause" hidden>
      <div class="dialog__card">
        <h2 class="dialog__title">Paused</h2>
        <div class="pause__actions">
          <button type="button" class="button button--resume">Resume</button>
          <button type="button" class="button button--exit">Exit to Menu</button>
        </div>
      </div>
    </div>
  `;

  return {
    root,
    shelf: getElement(root, '.shelf__grid'),
    cauldronList: getElement(root, '.cauldron__list'),
    recipeName: getElement(root, '.recipe__name'),
    recipeRanges: getElement(root, '.recipe__ranges'),
    recipeCounter: getElement(root, '.recipe__counter'),
    startButton: getElement<HTMLButtonElement>(root, '.button--start'),
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
    playAgainButton: getElement<HTMLButtonElement>(root, '.button--play-again'),
    pauseDialog: getElement(root, '.pause'),
    resumeButton: getElement<HTMLButtonElement>(root, '.button--resume'),
    exitButton: getElement<HTMLButtonElement>(root, '.button--exit'),
  };
}
