// Simple 24x24 SVG icons. They use `currentColor`, so the color comes from CSS.
const ICONS: Record<string, string> = {
  flame:
    '<path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 2 3 4 0-3-1-5 0-8z" fill="currentColor"/>',
  sparkle:
    '<polygon points="12,2 14.5,9.5 22,12 14.5,14.5 12,22 9.5,14.5 2,12 9.5,9.5" fill="currentColor"/>',
  snowflake:
    '<path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
  root: '<path d="M12 2v8M12 10c-4 2-5 6-6 12M12 10c4 2 5 6 6 12M12 10v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
  drop: '<path d="M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z" fill="currentColor"/>',
  void: '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="4" fill="none"/>',
  feather:
    '<path d="M20 4C10 4 5 10 4 20c4-6 9-8 12-10-3 0-6 1-8 3 2-5 6-8 12-9z" fill="currentColor"/>',
  slime:
    '<path d="M3 16c0-5 4-9 9-9s9 4 9 9c0 2-1 3-3 3-1 0-1-2-3-2s-2 3-4 3-2-3-4-3-1 2-2 2c-1 0-2-1-2-3z" fill="currentColor"/>',
};

export function getIngredientIcon(iconName: string): string {
  const shape = ICONS[iconName];

  if (!shape) {
    return '';
  }

  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${shape}</svg>`;
}
