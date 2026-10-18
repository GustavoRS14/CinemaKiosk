import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { FilterGroup } from '@components/Overlays/SlideOver/FilterSlideOver/FilterSlideOver';

const STORAGE_KEY = 'totem-active-movie-filters';
const FILTERS_EVENT = 'totem-movie-filters-change';

export function resetMovieFiltersSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(FILTERS_EVENT, { detail: [] }));
}

export type FilterableMovie = {
  filterValues?: readonly string[];
  genre?: string;
};

const FILTER_CATEGORIES = [
  { id: 'language', label: 'Idioma', values: ['Dublado', 'Legendado', 'Original'] },
  { id: 'experience', label: 'Experiência', values: ['2D', '3D', 'Laser', 'VIP', 'Azul', 'IMAX', 'Infinity Vision'] },
  { id: 'time', label: 'Horários', values: ['Manhã', 'Tarde', 'Noite'], layout: 'stack' as const },
] as const;

const TIME_LABELS: Record<string, string> = {
  Manhã: 'Manhã (Até 12:00)',
  Tarde: 'Tarde (12:00 - 18:00)',
  Noite: 'Noite (Após 18:00)',
};

export function getMovieFilterGroups(movies: readonly FilterableMovie[]): FilterGroup[] {
  const catalogValues = new Set(movies.flatMap((movie) => movie.filterValues ?? []));
  const groups: FilterGroup[] = FILTER_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    layout: 'layout' in category ? category.layout : undefined,
    options: category.values
      .filter((value) => catalogValues.has(value))
      .map((value) => ({ id: value, label: TIME_LABELS[value] ?? value })),
  }));
  const genres = [...new Set(movies.map((movie) => movie.genre).filter((genre): genre is string => Boolean(genre)))];
  groups.splice(2, 0, {
    id: 'genre',
    label: 'Gênero',
    options: genres.map((genre) => ({ id: genre, label: genre })),
  });
  return groups.filter((group) => group.options.length >= 2);
}

export function getMovieFilterOptionIds(groups: readonly FilterGroup[]) {
  return new Set(groups.flatMap((group) => group.options.map((option) => option.id)));
}

export type MovieFiltersPageProps = {
  /** Allows the filter page, tests and stories to provide the applied filters directly. */
  activeFilters?: readonly string[];
  onActiveFiltersChange?: (filters: string[]) => void;
};

const FILTER_ALIASES: Record<string, string> = {
  dub: 'dublado',
  dublada: 'dublado',
  leg: 'legendado',
  legendada: 'legendado',
};

function normalizeFilter(value: string) {
  const normalized = value.trim().toLocaleLowerCase('pt-BR');
  return FILTER_ALIASES[normalized] ?? normalized;
}

export function matchesMovieFilters(values: readonly string[], activeFilters: readonly string[]) {
  const normalizedValues = values.map(normalizeFilter);
  return activeFilters.map(normalizeFilter).every((filter) => normalizedValues.includes(filter));
}

function uniqueFilters(filters: readonly string[]) {
  return filters
    .map((filter) => filter.trim())
    .filter((filter, index, values) => Boolean(filter) && values.indexOf(filter) === index);
}

function readStoredFilters() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored) ? uniqueFilters(stored.filter((item): item is string => typeof item === 'string')) : [];
  } catch {
    return [];
  }
}

function readLocationFilters(search: string, state: unknown) {
  const stateFilters = (state as { activeFilters?: unknown } | null)?.activeFilters;
  if (Array.isArray(stateFilters)) {
    return uniqueFilters(stateFilters.filter((item): item is string => typeof item === 'string'));
  }

  const query = new URLSearchParams(search);
  const filters = query.getAll('filter');
  const groupedFilters = query.get('filters');
  if (groupedFilters) filters.push(...groupedFilters.split(','));
  return uniqueFilters(filters);
}

export function useMovieFilters({ activeFilters, onActiveFiltersChange }: MovieFiltersPageProps = {}) {
  const location = useLocation();
  const locationFilters = useMemo(
    () => readLocationFilters(location.search, location.state),
    [location.search, location.state],
  );
  const [internalFilters, setInternalFilters] = useState<string[]>(() =>
    uniqueFilters(activeFilters ?? (locationFilters.length > 0 ? locationFilters : readStoredFilters())),
  );

  useEffect(() => {
    if (activeFilters) setInternalFilters(uniqueFilters(activeFilters));
  }, [activeFilters]);

  useEffect(() => {
    if (!activeFilters && locationFilters.length > 0) setInternalFilters(locationFilters);
  }, [activeFilters, locationFilters]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleFiltersChange = (event: Event) => {
      if (!activeFilters && event instanceof CustomEvent && Array.isArray(event.detail)) {
        setInternalFilters(uniqueFilters(event.detail));
      }
    };
    window.addEventListener(FILTERS_EVENT, handleFiltersChange);
    return () => window.removeEventListener(FILTERS_EVENT, handleFiltersChange);
  }, [activeFilters]);

  const updateFilters = useCallback((nextFilters: string[]) => {
    const normalized = uniqueFilters(nextFilters);
    setInternalFilters(normalized);
    onActiveFiltersChange?.(normalized);

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent(FILTERS_EVENT, { detail: normalized }));
    }
  }, [onActiveFiltersChange]);

  const removeFilter = useCallback((filter: string) => {
    updateFilters(internalFilters.filter((item) => item !== filter));
  }, [internalFilters, updateFilters]);

  const clearFilters = useCallback(() => updateFilters([]), [updateFilters]);

  return { activeFilters: internalFilters, clearFilters, removeFilter, setFilters: updateFilters };
}

export function filterMovies<T extends FilterableMovie>(movies: readonly T[], activeFilters: readonly string[]) {
  if (activeFilters.length === 0) return [...movies];

  return movies.filter((movie) => {
    return matchesMovieFilters([
      ...(movie.filterValues ?? []),
      ...(movie.genre ? [movie.genre] : []),
    ], activeFilters);
  });
}
