import type { ILeaderboardEntry } from '../types/game';

export const MAX_LEADERBOARD_ENTRIES = 10;

// Letters, digits, spaces, underscores and hyphens, 2-15 characters.
const NAME_PATTERN = /^[a-zA-Z0-9 _-]{2,15}$/;

export function isValidPlayerName(name: string): boolean {
  return NAME_PATTERN.test(name);
}

// Highest score first. On a tie the earlier result (the smaller date) ranks
// higher.
export function sortLeaderboard(entries: ILeaderboardEntry[]): ILeaderboardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || a.date - b.date);
}

// True when this score would make the Top 10. A board that already has 10
// entries only takes a strictly higher score than its current lowest,
// since a tie favors the earlier result that is already on the board.
export function qualifiesForLeaderboard(entries: ILeaderboardEntry[], score: number): boolean {
  if (entries.length < MAX_LEADERBOARD_ENTRIES) {
    return true;
  }

  const sorted = sortLeaderboard(entries);
  const lowestScore = sorted[sorted.length - 1]?.score ?? 0;
  return score > lowestScore;
}

// Inserts a new entry, re-sorts, and keeps only the Top 10.
export function insertLeaderboardEntry(
  entries: ILeaderboardEntry[],
  newEntry: ILeaderboardEntry,
): ILeaderboardEntry[] {
  return sortLeaderboard([...entries, newEntry]).slice(0, MAX_LEADERBOARD_ENTRIES);
}

// "DD.MM.YYYY HH:MM"
export function formatLeaderboardDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()} ${hours}:${minutes}`;
}
