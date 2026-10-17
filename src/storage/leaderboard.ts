import type { ILeaderboardEntry } from '../types/game';

const STORAGE_KEY = 'alchemists-cauldron:leaderboard';

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

// Reads the saved leaderboard. Any storage or parsing problem (private
// browsing, storage disabled, corrupted data) is treated as an empty board
// instead of crashing the game.
export function loadLeaderboard(): ILeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLeaderboardEntry) : [];
  } catch {
    return [];
  }
}

// Writes the leaderboard. Fails silently (quota exceeded, storage disabled)
// so saving a score never crashes the game.
export function saveLeaderboard(entries: ILeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignored on purpose: a failed save should not break the game.
  }
}

export function clearLeaderboard(): void {
  saveLeaderboard([]);
}
