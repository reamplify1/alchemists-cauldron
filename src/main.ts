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
} from './state/game-state';
import { renderCauldron } from './ui/cauldron';
import { createGameScreen, type IGameScreen } from './ui/game-screen';
import { renderRecipe } from './ui/recipe';
import { renderShelf } from './ui/shelf';

function render(screen: IGameScreen): void {
  const { maxCauldronSize } = getSettings();
  const isPlaying = gameState.status === 'playing';

  renderShelf(
    screen.shelf,
    getShelfIngredients(),
    gameState.shelfStock,
    isCauldronFull(gameState.cauldronIngredients, maxCauldronSize),
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
    maxCauldronSize,
  );

  // Before the first run, show Start Game in the center instead of Brew.
  screen.startButton.hidden = isPlaying;
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

  render(screen);
}

startApp();
