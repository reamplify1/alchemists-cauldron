import { DIFFICULTY_LABELS } from '../logic/format-difficulty';
import { formatLeaderboardDate } from '../logic/leaderboard';
import type { Difficulty, ILeaderboardEntry } from '../types/game';

export interface ILeaderboardScreen {
  container: HTMLElement;
  body: HTMLElement;
  empty: HTMLElement;
}

function createCell(text: string): HTMLTableCellElement {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

// Every row belongs to the same difficulty list (see storage/leaderboard.ts
// — each difficulty keeps its own Top-10), so difficultyLabel is the same
// for all rows; it is still shown per row, as the task asks for a
// Difficulty column.
function createRow(
  entry: ILeaderboardEntry,
  rank: number,
  difficultyLabel: string,
): HTMLTableRowElement {
  const row = document.createElement('tr');
  row.append(
    createCell(String(rank)),
    createCell(entry.name),
    createCell(String(entry.score)),
    createCell(formatLeaderboardDate(entry.date)),
    createCell(difficultyLabel),
  );
  return row;
}

// entries is expected to already be sorted (see logic/leaderboard.ts), so
// the rank is simply its position in the list.
export function renderLeaderboard(
  screen: ILeaderboardScreen,
  isOpen: boolean,
  entries: ILeaderboardEntry[],
  difficulty: Difficulty,
): void {
  screen.container.hidden = !isOpen;

  if (!isOpen) {
    return;
  }

  const difficultyLabel = DIFFICULTY_LABELS[difficulty];
  screen.empty.hidden = entries.length > 0;
  screen.body.replaceChildren(
    ...entries.map((entry, index) => createRow(entry, index + 1, difficultyLabel)),
  );
}
