const TERMINAL_ID_KEY = 'totem-terminal-id';
export const DEFAULT_TERMINAL_ID = 'KSK01A';

export function getTerminalId() {
  if (typeof window === 'undefined') return DEFAULT_TERMINAL_ID;
  try {
    return window.localStorage.getItem(TERMINAL_ID_KEY) || DEFAULT_TERMINAL_ID;
  } catch {
    return DEFAULT_TERMINAL_ID;
  }
}

export function setTerminalId(terminalId: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TERMINAL_ID_KEY, terminalId.trim());
  } catch {
    // Keep the setup flow usable if persistent storage is unavailable.
  }
}
