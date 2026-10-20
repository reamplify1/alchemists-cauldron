import type { Difficulty, ILeaderboardEntry } from '../types/game';

// Level 2: each difficulty keeps its own Top-10 list, so a flood of Easy
// scores can never push a good Hard score off the board.
function getStorageKey(difficulty: Difficulty): string {
  return `alchemists-cauldron:leaderboard:${difficulty}`;
}

function isLeaderboardEntry(value: unknown): value is ILeaderboardEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.score === 'number' &&
    typeof entry.date === 'number'
  );
}

// Reads the saved leaderboard for one difficulty. Any storage or parsing
// problem (private browsing, storage disabled, corrupted data) is treated
// as an empty board instead of crashing the game.
export function loadLeaderboard(difficulty: Difficulty): ILeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(getStorageKey(difficulty));

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLeaderboardEntry) : [];
  } catch {
    return [];
  }
}

// Writes the leaderboard for one difficulty. Fails silently (quota
// exceeded, storage disabled) so saving a score never crashes the game.
export function saveLeaderboard(difficulty: Difficulty, entries: ILeaderboardEntry[]): void {
  try {
    localStorage.setItem(getStorageKey(difficulty), JSON.stringify(entries));
  } catch {
    // Ignored on purpose: a failed save should not break the game.
  }
}

export function clearLeaderboard(difficulty: Difficulty): void {
  saveLeaderboard(difficulty, []);
}
