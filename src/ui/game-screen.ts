export interface IGameScreen {
  root: HTMLElement;
  shelf: HTMLElement;
  cauldronList: HTMLElement;
  recipeName: HTMLElement;
  recipeRanges: HTMLElement;
  recipeCounter: HTMLElement;
  startButton: HTMLButtonElement;
  brewButton: HTMLButtonElement;
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

    <section class="recipe" aria-labelledby="recipe-title">
      <h2 class="section-title" id="recipe-title">Recipe</h2>
      <p class="recipe__name"></p>
      <ul class="recipe__ranges"></ul>
      <p class="recipe__counter"></p>
      <div class="recipe__actions">
        <button type="button" class="button button--start">Start Game</button>
        <button type="button" class="button button--brew" hidden>Brew</button>
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
  };
}
