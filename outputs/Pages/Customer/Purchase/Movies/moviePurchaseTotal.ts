const MOVIE_TICKET_TOTAL_KEY = 'totem-movie-purchase-ticket-total';
const MOVIE_TICKET_COUNT_KEY = 'totem-movie-purchase-ticket-count';
export const MOVIE_TICKET_TOTAL_EVENT = 'totem-movie-purchase-ticket-total-change';

export function getMovieTicketTotal(fallback = 0) {
  if (typeof window === 'undefined') return fallback;
  const raw = window.sessionStorage.getItem(MOVIE_TICKET_TOTAL_KEY);
  if (raw === null) return fallback;
  const stored = Number(raw);
  return Number.isFinite(stored) && stored >= 0 ? stored : fallback;
}

export function getMovieTicketCount() {
  if (typeof window === 'undefined') return 0;
  const count = Number(window.sessionStorage.getItem(MOVIE_TICKET_COUNT_KEY));
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

export function setMovieTicketTotal(total: number, ticketCount?: number) {
  if (typeof window === 'undefined' || !Number.isFinite(total)) return;
  window.sessionStorage.setItem(MOVIE_TICKET_TOTAL_KEY, String(Math.max(0, total)));
  if (ticketCount !== undefined) {
    window.sessionStorage.setItem(MOVIE_TICKET_COUNT_KEY, String(Math.max(0, Math.floor(ticketCount))));
  }
  window.dispatchEvent(new CustomEvent(MOVIE_TICKET_TOTAL_EVENT));
}

export function resetMoviePurchaseTotal() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(MOVIE_TICKET_TOTAL_KEY);
  window.sessionStorage.removeItem(MOVIE_TICKET_COUNT_KEY);
  window.dispatchEvent(new CustomEvent(MOVIE_TICKET_TOTAL_EVENT));
}
