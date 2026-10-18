import { useMemo, useState, type UIEvent } from 'react';

import NoResultIllustration from '@illustrations/NoResult.svg';
import SearchIcon from '@icons/search.svg';
import SettingsIcon from '@icons/settings.svg';
import TrashIcon from '@icons/trash.svg';

import { FilterTag } from '../../../Common/FilterTag';
import { Input } from '../../../Common/Input';
import { ModalFooter } from '../../../Common/ModalFooter';
import { ModalHeader } from '../../../Common/ModalHeader';
import { NoticeBox } from '../../../Common/NoticeBox';
import { SelectionCard } from '../../../Common/SelectionCard';
import { ShowtimeButton } from '../../../Common/ShowtimeButton';
import { ShowtimeCarousel } from '../../../Common/ShowtimeCarousel';
import { Tag } from '../../../Common/Tag';
import { TextButton } from '../../../Common/TextButton';
import { localizeMovieGenre, normalizeMovieLanguage, resolveMovieLanguage } from '../../../Common/movieLocalization';
import { useI18n } from '../../../../i18n';
import './MovieSessionSelectionSlideOver.css';

export type MovieSelectionOption = {
  id: string;
  title: string;
  supportingText: string;
  posterUrl: string;
};

export type ShowtimeSelectionGroup = {
  id: string;
  originCountry?: string;
  tags: Array<{ text: string; status: 'Brand' | 'Information' }>;
  times: string[];
};

export type MovieSessionSelectionSlideOverProps = {
  type?: 'movie' | 'showtime';
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  movies?: MovieSelectionOption[];
  showtimeGroups?: ShowtimeSelectionGroup[];
  selectedId?: string;
  searchValue?: string;
  activeFilters?: string[];
  onSearchChange?: (value: string) => void;
  onSearchFieldClick?: () => void;
  onSelectionChange?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onOpenFilters?: () => void;
  onClearFilters?: () => void;
  onRemoveFilter?: (filter: string) => void;
  onClose?: () => void;
  className?: string;
};

export function MovieSessionSelectionSlideOver({
  type = 'movie',
  width = type === 'movie' ? 'sm' : 'md',
  movies = [],
  showtimeGroups = [],
  selectedId,
  searchValue,
  activeFilters = [],
  onSearchChange,
  onSearchFieldClick,
  onSelectionChange,
  onConfirm,
  onOpenFilters,
  onClearFilters,
  onRemoveFilter,
  onClose,
  className = '',
}: MovieSessionSelectionSlideOverProps) {
  const { locale, t } = useI18n();
  const [internalSearch, setInternalSearch] = useState('');
  const [internalSelectedId, setInternalSelectedId] = useState<string>();
  const [isScrolled, setIsScrolled] = useState(false);
  const query = searchValue ?? internalSearch;
  const activeId = selectedId ?? internalSelectedId;

  const filteredMovies = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return movies;
    return movies.filter(movie => `${movie.title} ${movie.supportingText}`.toLocaleLowerCase('pt-BR').includes(normalized));
  }, [movies, query]);

  const choose = (id: string) => {
    if (selectedId === undefined) setInternalSelectedId(id);
    onSelectionChange?.(id);
  };

  const updateSearch = (value: string) => {
    if (searchValue === undefined) setInternalSearch(value);
    onSearchChange?.(value);
  };

  const noResults = type === 'movie' ? filteredMovies.length === 0 : showtimeGroups.length === 0;
  const localizeFilter = (filter: string) => {
    const normalized = filter.trim().toLocaleLowerCase('pt-BR');
    if (['dub', 'dublado', 'leg', 'legendado', 'original'].includes(normalized)) return t(normalizeMovieLanguage(filter));
    if (normalized === 'manhã') return t('filters.morningShort');
    if (normalized === 'tarde') return t('filters.afternoonShort');
    if (normalized === 'noite') return t('filters.nightShort');
    if (normalized === 'azul') return t('filters.blueSession');
    return localizeMovieGenre(filter, t);
  };
  const title = type === 'movie' ? t('sessionSelection.movie') : t('sessionSelection.showtime');

  return (
    <aside
      className={`movie-session-selection-slide-over ${isScrolled ? 'movie-session-selection-slide-over--scrolled' : ''} ${className}`.trim()}
      data-width={width}
      aria-label={title}
    >
      <ModalHeader
        text={title}
        onClose={onClose}
        className="movie-session-selection-slide-over__header"
      />

      <div
        className="movie-session-selection-slide-over__content"
        onScroll={(event: UIEvent<HTMLDivElement>) => setIsScrolled(event.currentTarget.scrollTop > 0)}
      >
        {type === 'movie' ? (
          <Input
            placeholder={t('sessionSelection.searchMovie')}
            aria-label={t('sessionSelection.searchMovieAria')}
            value={query}
            state={query ? 'Filled' : 'Default'}
            controlRole={onSearchFieldClick ? 'button' : undefined}
            controlTabIndex={onSearchFieldClick ? 0 : undefined}
            onControlClick={onSearchFieldClick}
            onControlKeyDown={onSearchFieldClick ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') onSearchFieldClick();
            } : undefined}
            onChange={event => updateSearch(event.target.value)}
            showIconLeft
            iconLeft={<SearchIcon aria-hidden="true" />}
          />
        ) : (
          <div className="movie-session-selection-slide-over__filter-controls">
            <Input
              className="movie-session-selection-slide-over__filter-trigger"
              aria-label={t('movies.openFiltersAria')}
              value={t('filters.title')}
              state="Filled"
              readOnly
              showIconLeft
              iconLeft={<SettingsIcon aria-hidden="true" />}
              showBadge={activeFilters.length > 0}
              badgeText={String(activeFilters.length)}
              onClick={onOpenFilters}
            />
            {activeFilters.length > 0 && (
              <div className="movie-session-selection-slide-over__active-filters">
                <span>{t('movies.activeFilters')}</span>
                {activeFilters.map(filter => <FilterTag key={filter} label={localizeFilter(filter)} onClose={() => onRemoveFilter?.(filter)} />)}
              </div>
            )}
          </div>
        )}

        {!noResults && type === 'showtime' && (
          <NoticeBox
            status="Warning"
            borderRadius="md"
            message={t('sessionSelection.deliveryUnavailable')}
          />
        )}

        {noResults ? (
          <div className="movie-session-selection-slide-over__empty" role="status">
            <NoResultIllustration className="movie-session-selection-slide-over__empty-illustration" aria-hidden="true" />
            <div className="movie-session-selection-slide-over__empty-copy">
              <h2>{t('movies.emptyTitle')}</h2>
              <p>{type === 'movie'
                ? t('organization.noMatches')
                : t('movies.emptyDescription')}</p>
            </div>
            <div className="movie-session-selection-slide-over__empty-actions">
              <TextButton
                label={type === 'movie' ? t('organization.clearSearch') : t('filters.clear')}
                intent="Danger"
                size="sm"
                weight="Medium"
                hasRightIcon
                rightIcon={<TrashIcon aria-hidden="true" />}
                onClick={type === 'movie' ? () => updateSearch('') : onClearFilters}
              />
              {type === 'showtime' && (
                <TextButton
                  label={t('action.changeFilters')}
                  intent="Information"
                  size="sm"
                  weight="Medium"
                  hasRightIcon
                  rightIcon={<SettingsIcon aria-hidden="true" />}
                  onClick={onOpenFilters}
                />
              )}
            </div>
          </div>
        ) : type === 'movie' ? (
          <div className="movie-session-selection-slide-over__movies" role="radiogroup" aria-label={t('navigation.movies')}>
            {filteredMovies.map(movie => (
              <SelectionCard
                key={movie.id}
                className="movie-session-selection-slide-over__movie"
                selected={activeId === movie.id}
                title={movie.title}
                supportingText={movie.supportingText}
                textSize="sm"
                textWeight="Medium"
                showMoviePoster
                moviePosterImageUrl={movie.posterUrl}
                moviePosterTitle={movie.title}
                onClick={() => choose(movie.id)}
              />
            ))}
          </div>
        ) : (
          <div className="movie-session-selection-slide-over__showtime-groups">
            {showtimeGroups.map(group => (
              <section key={group.id} className="movie-session-selection-slide-over__showtime-group">
                <div className="movie-session-selection-slide-over__tags">
                  {group.tags.map((tag, index) => (
                    <Tag
                      key={`${tag.status}-${tag.text}`}
                      text={index === 0
                        ? t(resolveMovieLanguage(tag.text, group.originCountry, locale))
                        : localizeFilter(tag.text)}
                      status={tag.status}
                    />
                  ))}
                </div>
                <ShowtimeCarousel
                  className="movie-session-selection-slide-over__showtime-carousel"
                  dragEnabled
                  itemsPerPage={3}
                >
                  {group.times.map(time => {
                    const id = `${group.id}-${time}`;
                    return (
                      <ShowtimeButton
                        key={id}
                        time={time}
                        showtimeDate="2099-01-01"
                        selectable={true}
                        selected={activeId === id}
                        onClick={() => choose(id)}
                      />
                    );
                  })}
                </ShowtimeCarousel>
              </section>
            ))}
          </div>
        )}
      </div>

      <ModalFooter
        className="movie-session-selection-slide-over__footer"
        showTotalPrice={false}
        primaryLabel={t('organization.confirmSelection')}
        primaryDisabled={!activeId}
        onPrimaryAction={() => activeId && onConfirm?.(activeId)}
      />
    </aside>
  );
}
