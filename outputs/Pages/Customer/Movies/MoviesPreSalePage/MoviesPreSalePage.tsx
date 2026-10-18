import { useEffect, useState, type ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccessibilityIcon from '@icons/accessibility.svg';
import HomeIcon from '@icons/home.svg';
import { requestCustomerHomeExit } from '@components/Overlays/CustomerHomeExitDialog';
import MoviesIcon from '@icons/video.svg';
import PopcornIcon from '@icons/popcorn.svg';
import { MovieListingCard } from '@components/Common/MovieListingCard';
import { formatLocalizedCalendarDate } from '@components/Common/movieLocalization';
import { PageLoadingScreen, usePageLoadingScreen } from '@components/Common/PageLoadingScreen';
import { Header } from '@components/Layout/Header';
import { Navbar } from '@components/Layout/Navbar';
import { NavbarButton } from '@components/Layout/Navbar/NavbarButton';
import { useFeaturePreferences } from '../../../featurePreferences';
import { useOrientation } from '../../../useOrientation';
import { useI18n } from '../../../../i18n';
import { CustomerAccessibilityOverlay } from '../../CustomerAccessibilityOverlay';
import { CustomerConcessionCart } from '../../Concessions/CustomerConcessionCart';
import { MoviesEmptyState, MoviesPageFilters } from '../MoviesPageFilters';
import { filterMovies, getMovieFilterGroups, getMovieFilterOptionIds, useMovieFilters, type MovieFiltersPageProps } from '../movieFilters';
import { MoviesFilterOverlay } from '../MoviesFilterOverlay';
import {
  getUpcomingPreSaleMovies,
  hasPreSaleMovies,
  usePreSaleClock,
} from '../preSaleMovies';
import { CUSTOMER_FLOW_RESET_EVENT } from '../../customerFlowReset';
import type { MovieDetailsNavigationState } from '../movieNavigation';
import './MoviesPreSalePage.css';

const icon = (Icon: ComponentType | string) => (
  typeof Icon === 'string' ? <img src={Icon} alt="" aria-hidden="true" /> : <Icon />
);

const isCompactMoviesViewport = () => {
  if (typeof window === 'undefined') return false;

  const widths = [
    window.innerWidth,
    window.visualViewport?.width,
    document.documentElement.clientWidth,
    window.screen?.width,
    window.screen?.availWidth,
  ].filter((width): width is number => typeof width === 'number' && width > 0);

  return Math.min(...widths) <= 1128;
};

export function MoviesPreSalePage(filterProps: MovieFiltersPageProps) {
  const isPageLoading = usePageLoadingScreen();
  const orientation = useOrientation();
  const { formatDurationToMinutes, showAuditorium, showExperienceBadges } = useFeaturePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, t } = useI18n();
  const [isCompactHorizontal, setIsCompactHorizontal] = useState(isCompactMoviesViewport);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { activeFilters, clearFilters, removeFilter, setFilters } = useMovieFilters(filterProps);
  const nowTimestamp = usePreSaleClock();
  const upcomingMovies = getUpcomingPreSaleMovies(nowTimestamp);
  const filteredMovies = filterMovies(upcomingMovies, activeFilters);
  const filterGroups = getMovieFilterGroups(upcomingMovies);
  const availableFilterIds = getMovieFilterOptionIds(filterGroups);
  const showEmptyState = activeFilters.length > 0 && filteredMovies.length === 0;

  useEffect(() => {
    const validFilters = activeFilters.filter((filter) => availableFilterIds.has(filter));
    if (validFilters.length !== activeFilters.length) setFilters(validFilters);
  }, [activeFilters, availableFilterIds, setFilters]);

  useEffect(() => {
    const resetPageState = () => {
      setIsAccessibilityOpen(false);
      setIsFilterOpen(false);
    };
    window.addEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
    return () => window.removeEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
  }, []);

  useEffect(() => {
    const updateCompactLayout = () => setIsCompactHorizontal(isCompactMoviesViewport());

    updateCompactLayout();
    window.addEventListener('resize', updateCompactLayout);
    window.visualViewport?.addEventListener('resize', updateCompactLayout);

    return () => {
      window.removeEventListener('resize', updateCompactLayout);
      window.visualViewport?.removeEventListener('resize', updateCompactLayout);
    };
  }, []);

  return (
    <div className={`page-wrapper movies-pre-sale-page page-wrapper--${orientation}${orientation === 'horizontal' && isCompactHorizontal ? ' page-wrapper--compact-horizontal' : ''}${isPageLoading ? ' page-loading-active' : ''}`}>
      <Header context="Customer" type="Default" />
      <PageLoadingScreen active={isPageLoading} />
      <div className="movies-pre-sale-page__shell">
        <Navbar className="movies-pre-sale-page__navbar" orientation={orientation}>
          <NavbarButton label={t('navigation.home')} icon={icon(HomeIcon)} selected={false} onClick={requestCustomerHomeExit} />
          <NavbarButton label={t('navigation.movies')} icon={icon(MoviesIcon)} selected onClick={() => navigate('/movies')} />
          <NavbarButton label={t('navigation.concessions')} icon={icon(PopcornIcon)} selected={false} onClick={() => navigate('/concessions')} />
          <NavbarButton label={t('navigation.accessibility')} icon={icon(AccessibilityIcon)} variant="Accessibility" onClick={() => setIsAccessibilityOpen(true)} />
        </Navbar>

        <main className="movies-pre-sale-page__main">
          <section className="movies-pre-sale-page__content" aria-labelledby="movies-pre-sale-page-title">
            <h1 id="movies-pre-sale-page-title">{t('movies.heading')}</h1>

            <MoviesPageFilters
              activeFilters={activeFilters}
              selectedTab={2}
              showPreSale={hasPreSaleMovies(nowTimestamp)}
              onRemoveFilter={removeFilter}
              onOpenFilters={() => setIsFilterOpen(true)}
            />

            {showEmptyState ? (
              <MoviesEmptyState onClearFilters={clearFilters} />
            ) : (
            <section className="movies-pre-sale-page__catalog" aria-label={t('movies.preSaleCatalogAria')}>
              <div className="movies-pre-sale-page__grid">
                {filteredMovies.map(({
                  filterValues: _filterValues,
                  releaseDate,
                  blocks: _blocks,
                  ...movie
                }) => (
                  <MovieListingCard
                    showAuditorium={showAuditorium}
                    showExperienceBadges={showExperienceBadges}
                    key={movie.movieTitle}
                    type="Simplified"
                    formatDurationToMinutes={formatDurationToMinutes}
                    onClick={() => navigate('/movies/details', {
                      state: {
                        movie: { ...movie, blocks: _blocks, posterTagLabel: formatLocalizedCalendarDate(releaseDate, locale) },
                        returnPath: `${location.pathname}${location.search}`,
                      } satisfies MovieDetailsNavigationState,
                    })}
                    {...movie}
                    posterTagLabel={formatLocalizedCalendarDate(releaseDate, locale)}
                  />
                ))}
              </div>
            </section>
            )}
          </section>
        </main>
      </div>
      <CustomerConcessionCart orientation={orientation} />
      <CustomerAccessibilityOverlay
        open={isAccessibilityOpen}
        orientation={orientation}
        onClose={() => setIsAccessibilityOpen(false)}
      />
      <MoviesFilterOverlay open={isFilterOpen} orientation={orientation} groups={filterGroups} activeFilters={activeFilters} onApply={setFilters} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
}
