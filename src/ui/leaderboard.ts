import { formatLeaderboardDate } from '../logic/leaderboard';
import type { ILeaderboardEntry } from '../types/game';

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

function createRow(entry: ILeaderboardEntry, rank: number): HTMLTableRowElement {
  const row = document.createElement('tr');
  row.append(
    createCell(String(rank)),
    createCell(entry.name),
    createCell(String(entry.score)),
    createCell(formatLeaderboardDate(entry.date)),
  );
  return row;
}

// entries is expected to already be sorted (see logic/leaderboard.ts), so
// the rank is simply its position in the list.
export function renderLeaderboard(
  screen: ILeaderboardScreen,
  isOpen: boolean,
  entries: ILeaderboardEntry[],
): void {
  screen.container.hidden = !isOpen;

  if (!isOpen) {
    return;
  }

  screen.empty.hidden = entries.length > 0;
  screen.body.replaceChildren(...entries.map((entry, index) => createRow(entry, index + 1)));
}
