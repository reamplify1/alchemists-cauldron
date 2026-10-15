import { defineConfig } from 'vite';

// GitHub Pages serves the game from "/alchemists-cauldron/", so the
// production build needs that base path. The dev server keeps "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/alchemists-cauldron/' : '/',
}));
