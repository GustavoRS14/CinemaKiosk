import { useEffect, useState, type ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccessibilityIcon from '@icons/accessibility.svg';
import HomeIcon from '@icons/home.svg';
import { requestCustomerHomeExit } from '@components/Overlays/CustomerHomeExitDialog';
import MoviesIcon from '@icons/video.svg';
import PopcornIcon from '@icons/popcorn.svg';
import AguasMortaisPoster from '@images/aguas-mortais-2.png';
import AOdisseiaPoster from '@images/a-odisseia-2.png';
import MinionsMonstrosPoster from '@images/minions-monstros-2.png';
import MoanaPoster from '@images/moana-2.png';
import ToyStoryPoster from '@images/toy-story-5-2.png';
import MinhaMelhorAmigaPoster from '@images/minha-melhor-amiga-2.png';
import { DateCarousel } from '@components/Common/DateCarousel';
import { PageLoadingScreen, usePageLoadingScreen } from '@components/Common/PageLoadingScreen';
import { MovieListingCard, type MovieListingCardProps } from '@components/Common/MovieListingCard';
import {
  DEFAULT_SALES_CUTOFF_MINUTES,
  isShowtimeAvailable,
  useShowtimeClock,
} from '@components/Common/ShowtimeButton';
import { Header } from '@components/Layout/Header';
import { Navbar } from '@components/Layout/Navbar';
import { NavbarButton } from '@components/Layout/Navbar/NavbarButton';
import { useFeaturePreferences } from '../../../featurePreferences';
import { useOrientation } from '../../../useOrientation';
import { useI18n } from '../../../../i18n';
import { CustomerAccessibilityOverlay } from '../../CustomerAccessibilityOverlay';
import { CustomerConcessionCart } from '../../Concessions/CustomerConcessionCart';
import { MoviesEmptyState, MoviesPageFilters } from '../MoviesPageFilters';
import { filterMovies, getMovieFilterGroups, getMovieFilterOptionIds, useMovieFilters, type FilterableMovie, type MovieFiltersPageProps } from '../movieFilters';
import { MoviesFilterOverlay } from '../MoviesFilterOverlay';
import { hasPreSaleMovies, usePreSaleClock } from '../preSaleMovies';
import { CUSTOMER_FLOW_RESET_EVENT } from '../../customerFlowReset';
import type { MovieDetailsNavigationState } from '../movieNavigation';
import './MoviesAnotherDayPage.css';

type Movie = Pick<
  MovieListingCardProps,
  'duration' | 'genre' | 'movieTitle' | 'originCountry' | 'posterImageUrl' | 'posterTagLabel' | 'posterRatingValue'
> & FilterableMovie & {
  showtimesByDate: Record<string, Array<{
    time: string;
    salesCutoffMinutes?: number;
    availableSeats?: number;
  }>>;
};

const availableDates = [
  { day: 'Sáb', date: '20', month: 'Mar', isoDate: '2027-03-20' },
  { day: 'Dom', date: '21', month: 'Mar', isoDate: '2027-03-21' },
  { day: 'Seg', date: '22', month: 'Mar', isoDate: '2027-03-22' },
  { day: 'Ter', date: '23', month: 'Mar', isoDate: '2027-03-23' },
  { day: 'Qua', date: '24', month: 'Mar', isoDate: '2027-03-24' },
  { day: 'Qui', date: '25', month: 'Mar', isoDate: '2027-03-25' },
  { day: 'Sex', date: '26', month: 'Mar', isoDate: '2027-03-26' },
];

const scheduleForDates = (times: string[]) => Object.fromEntries(
  availableDates.map(({ isoDate }) => [isoDate, times.map((time) => ({ time }))]),
);

const movies: Movie[] = [
  { movieTitle: 'A Odisseia', posterImageUrl: AOdisseiaPoster, posterTagLabel: 'Estreia', posterRatingValue: '18', genre: 'Ação', duration: '180', filterValues: ['2D', 'Dublado', 'Laser', 'Manhã'], showtimesByDate: scheduleForDates(['10:00', '11:30']) },
  { movieTitle: 'Toy Story 5', posterImageUrl: ToyStoryPoster, posterTagLabel: '', posterRatingValue: '6', genre: 'Animação', duration: '90', filterValues: ['2D', 'Dublado', 'Tarde'], showtimesByDate: scheduleForDates(['14:00', '16:00']) },
  { movieTitle: 'Moana', posterImageUrl: MoanaPoster, posterTagLabel: '', posterRatingValue: '10', genre: 'Aventura', duration: '120', filterValues: ['3D', 'Dublado', 'VIP', 'Noite'], showtimesByDate: scheduleForDates(['19:30', '22:00']) },
  { movieTitle: 'Minions & Monstros', posterImageUrl: MinionsMonstrosPoster, posterTagLabel: '', posterRatingValue: '10', genre: 'Animação', duration: '120', filterValues: ['2D', 'Legendado', 'Laser', 'Noite'], showtimesByDate: scheduleForDates(['20:00', '22:30']) },
  { movieTitle: 'Águas Mortais', posterImageUrl: AguasMortaisPoster, posterTagLabel: '', posterRatingValue: '16', genre: 'Suspense', duration: '106', filterValues: ['2D', 'Legendado', 'Noite'], showtimesByDate: scheduleForDates(['21:00', '23:15']) },
  { movieTitle: 'Minha Melhor Amiga', originCountry: 'Brasil', posterImageUrl: MinhaMelhorAmigaPoster, posterTagLabel: '', posterRatingValue: '12', genre: 'Comédia', duration: '119', filterValues: ['2D', 'Original', 'Manhã'], showtimesByDate: scheduleForDates(['10:30', '13:00']) },
];

const icon = (Icon: ComponentType) => <Icon />;

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

type MoviesAnotherDayPageProps = MovieFiltersPageProps & {
  salesCutoffMinutes?: number;
};

export function MoviesAnotherDayPage({
  salesCutoffMinutes = DEFAULT_SALES_CUTOFF_MINUTES,
  ...filterProps
}: MoviesAnotherDayPageProps) {
  const isPageLoading = usePageLoadingScreen();
  const orientation = useOrientation();
  const { formatDurationToMinutes, showAuditorium, showExperienceBadges } = useFeaturePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [selectedDateKey, setSelectedDateKey] = useState(availableDates[0].isoDate);
  const [isCompactHorizontal, setIsCompactHorizontal] = useState(isCompactMoviesViewport);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { activeFilters, clearFilters, removeFilter, setFilters } = useMovieFilters(filterProps);
  const preSaleNowTimestamp = usePreSaleClock();
  const scheduleDescriptors = movies.flatMap((movie) => Object.entries(movie.showtimesByDate)
    .flatMap(([showtimeDate, showtimes]) => showtimes.map((showtime) => ({
      ...showtime,
      showtimeDate,
      salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
    }))));
  const nowTimestamp = useShowtimeClock(scheduleDescriptors, salesCutoffMinutes);
  const visibleDates = availableDates.filter(({ isoDate }) => movies.some((movie) => (
    (movie.showtimesByDate[isoDate] ?? []).some((showtime) => isShowtimeAvailable({
      ...showtime,
      showtimeDate: isoDate,
      salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
    }, nowTimestamp, salesCutoffMinutes))
  )));
  const selectedDate = visibleDates.find(({ isoDate }) => isoDate === selectedDateKey) ?? visibleDates[0];

  useEffect(() => {
    if (selectedDate && selectedDate.isoDate !== selectedDateKey) {
      setSelectedDateKey(selectedDate.isoDate);
    }
  }, [selectedDate, selectedDateKey]);

  useEffect(() => {
    const resetPageState = () => {
      setSelectedDateKey(availableDates[0].isoDate);
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

  const availableMoviesForDate = selectedDate
    ? movies.filter((movie) => (movie.showtimesByDate[selectedDate.isoDate] ?? [])
      .some((showtime) => isShowtimeAvailable({
        ...showtime,
        showtimeDate: selectedDate.isoDate,
        salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
      }, nowTimestamp, salesCutoffMinutes)))
    : [];
  const filteredMovies = filterMovies(availableMoviesForDate, activeFilters);
  const filterGroups = getMovieFilterGroups(availableMoviesForDate);
  const availableFilterIds = getMovieFilterOptionIds(filterGroups);
  const showEmptyState = activeFilters.length > 0
    && availableMoviesForDate.length > 0
    && filteredMovies.length === 0;

  useEffect(() => {
    const validFilters = activeFilters.filter((filter) => availableFilterIds.has(filter));
    if (validFilters.length !== activeFilters.length) setFilters(validFilters);
  }, [activeFilters, availableFilterIds, setFilters]);

  return (
    <div className={`page-wrapper movies-another-day-page page-wrapper--${orientation}${orientation === 'horizontal' && isCompactHorizontal ? ' page-wrapper--compact-horizontal' : ''}${isPageLoading ? ' page-loading-active' : ''}`}>
      <Header context="Customer" type="Default" />
      <PageLoadingScreen active={isPageLoading} />
      <div className="movies-another-day-page__shell">
        <Navbar className="movies-another-day-page__navbar" orientation={orientation}>
          <NavbarButton label={t('navigation.home')} icon={icon(HomeIcon)} selected={false} onClick={requestCustomerHomeExit} />
          <NavbarButton label={t('navigation.movies')} icon={icon(MoviesIcon)} selected onClick={() => navigate('/movies')} />
          <NavbarButton label={t('navigation.concessions')} icon={icon(PopcornIcon)} selected={false} onClick={() => navigate('/concessions')} />
          <NavbarButton label={t('navigation.accessibility')} icon={icon(AccessibilityIcon)} variant="Accessibility" onClick={() => setIsAccessibilityOpen(true)} />
        </Navbar>

        <main className="movies-another-day-page__main">
          <section className="movies-another-day-page__content" aria-labelledby="movies-another-day-page-title">
            <h1 id="movies-another-day-page-title">{t('movies.heading')}</h1>

            <MoviesPageFilters
              activeFilters={activeFilters}
              selectedTab={1}
              showPreSale={hasPreSaleMovies(preSaleNowTimestamp)}
              onRemoveFilter={removeFilter}
              onOpenFilters={() => setIsFilterOpen(true)}
            />

            {showEmptyState ? (
              <MoviesEmptyState onClearFilters={clearFilters} />
            ) : (
            <section className="movies-another-day-page__catalog" aria-labelledby="available-dates-title">
              <div className="movies-another-day-page__date-selector">
                <h2 id="available-dates-title">{t('movies.availableDates')}</h2>
                <DateCarousel
                  className="movies-another-day-page__dates"
                  ariaLabel={t('movies.availableDatesAria')}
                  items={visibleDates.map(({ isoDate, ...date }) => ({ id: isoDate, ...date }))}
                  selectedId={selectedDate?.isoDate}
                  onSelect={setSelectedDateKey}
                />
              </div>
              <div className="movies-another-day-page__grid" aria-live="polite">
                {filteredMovies.map(({
                  filterValues: _filterValues,
                  showtimesByDate: _showtimesByDate,
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
                        movie: {
                          ...movie,
                          blocks: [{
                            tag1: _filterValues?.includes('Original') ? 'Original' : 'Dub',
                            tag2: _filterValues?.includes('3D') ? '3D' : '2D',
                            showtimes: (selectedDate
                              ? _showtimesByDate[selectedDate.isoDate] ?? []
                              : []).map((showtime) => ({
                                time: showtime.time,
                                state: 'Normal' as const,
                                seats: showtime.availableSeats,
                                salesCutoffMinutes: showtime.salesCutoffMinutes,
                                showtimeDate: selectedDate?.isoDate,
                              })),
                          }],
                        },
                        returnPath: `${location.pathname}${location.search}`,
                      } satisfies MovieDetailsNavigationState,
                    })}
                    {...movie}
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
