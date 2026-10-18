export type TerminalLocation = {
  network: string;
  complex: string;
};

const LOCATION_STORAGE_KEY = 'totem-location';
export const LOCATION_PREFERENCES_EVENT = 'totem-location-preferences-change';
const DEFAULT_LOCATION: TerminalLocation = {
  network: 'Cinesercla Cinemas',
  complex: 'Shopping Norte',
};

export function getLocationPreferences(): TerminalLocation {
  if (typeof window === 'undefined') return DEFAULT_LOCATION;
  try {
    const stored = JSON.parse(window.localStorage.getItem(LOCATION_STORAGE_KEY) ?? '{}') as Partial<TerminalLocation>;
    return {
      network: stored.network?.trim() || DEFAULT_LOCATION.network,
      complex: stored.complex?.trim() || DEFAULT_LOCATION.complex,
    };
  } catch {
    return DEFAULT_LOCATION;
  }
}

export function setLocationPreferences(location: TerminalLocation) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
      network: location.network.trim(),
      complex: location.complex.trim(),
    }));
    window.dispatchEvent(new CustomEvent(LOCATION_PREFERENCES_EVENT));
    void window.totemDesktop?.updateTenantIcon(getTenantFromNetwork(location.network));
  } catch {
    // Keep the terminal usable when persistent storage is unavailable.
  }
}

const NETWORK_TENANTS: Record<string, string> = {
  'arcoplex cinemas': 'arcoplex',
  'cine araújo': 'cine-araujo',
  cinemais: 'cinemais',
  'cinesercla cinemas': 'cinesercla',
  'cine show': 'cine-show',
  'circuito cinemas': 'circuito',
  multicine: 'multicine',
  kinoplex: 'kinoplex',
  cineflix: 'cineflix',
};

export function getTenantFromNetwork(network: string) {
  const normalizedNetwork = network.trim().toLocaleLowerCase('pt-BR');
  return NETWORK_TENANTS[normalizedNetwork]
    ?? normalizedNetwork
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+cinemas?$/, '')
      .replace(/[^a-z0-9]+/g, '-');
}

export function getTenantPreference() {
  return getTenantFromNetwork(getLocationPreferences().network);
}
