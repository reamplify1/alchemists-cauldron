export interface IGameScreen {
  root: HTMLElement;
  shelf: HTMLElement;
  cauldronList: HTMLElement;
  cauldronCounter: HTMLElement;
}

function getElement(root: HTMLElement, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);

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

    <section class="shelf" aria-labelledby="shelf-title">
      <h2 class="section-title" id="shelf-title">Ingredient Shelf</h2>
      <div class="shelf__grid"></div>
    </section>

    <section class="cauldron" aria-labelledby="cauldron-title">
      <h2 class="section-title" id="cauldron-title">Cauldron</h2>
      <p class="cauldron__counter"></p>
      <ol class="cauldron__list"></ol>
    </section>
  `;

  return {
    root,
    shelf: getElement(root, '.shelf__grid'),
    cauldronList: getElement(root, '.cauldron__list'),
    cauldronCounter: getElement(root, '.cauldron__counter'),
  };
}
