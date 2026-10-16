import './styles/style.css';
import { isCauldronFull } from './logic/cauldron';
import {
  addIngredient,
  fillShelf,
  gameState,
  getSettings,
  getShelfIngredients,
} from './state/game-state';
import { renderCauldron } from './ui/cauldron';
import { createGameScreen, type IGameScreen } from './ui/game-screen';
import { renderShelf } from './ui/shelf';

function render(screen: IGameScreen): void {
  const { maxCauldronSize } = getSettings();

  renderShelf(
    screen.shelf,
    getShelfIngredients(),
    gameState.shelfStock,
    isCauldronFull(gameState.cauldronIngredients, maxCauldronSize),
  );
  renderCauldron(
    screen.cauldronList,
    screen.cauldronCounter,
    gameState.cauldronIngredients,
    maxCauldronSize,
  );
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

  // Temporary: the shelf is filled right away. The Start Game button that
  // starts a new game will replace this in US 1.4.
  fillShelf();
  render(screen);
}

startApp();
