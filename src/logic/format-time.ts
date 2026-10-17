// "MM:SS", e.g. 150 -> "02:30", 9 -> "00:09". Negative input is clamped to 0.
export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
