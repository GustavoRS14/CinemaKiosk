export function parseMovieDurationMinutes(duration: string): number | null {
  const match = duration.match(/\d+/);
  if (!match) return null;
  const minutes = Number.parseInt(match[0], 10);
  return Number.isFinite(minutes) ? minutes : null;
}

export function formatMovieDuration(duration: string, showInMinutes: boolean, locale = 'pt-BR'): string {
  const totalMinutes = parseMovieDurationMinutes(duration);
  if (totalMinutes === null) return duration.trim();
  if (locale === 'pt-BR' && (showInMinutes || totalMinutes < 60)) return `${totalMinutes}min`;

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  if (locale === 'en-US') return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}
