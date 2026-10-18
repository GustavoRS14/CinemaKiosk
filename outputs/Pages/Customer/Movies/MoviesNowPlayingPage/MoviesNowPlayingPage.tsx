import { useEffect, useState, type ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccessibilityIcon from '@icons/accessibility.svg';
import HomeIcon from '@icons/home.svg';
import MoviesIcon from '@icons/video.svg';
import PopcornIcon from '@icons/popcorn.svg';
import InformationCircleIcon from '@icons/information-circle.svg';
import AguasMortaisPoster from '@images/aguas-mortais-1.png';
import AOdisseiaPoster from '@images/a-odisseia-1.png';
import MinionsMonstrosPoster from '@images/minions-monstros-1.png';
import MoanaPoster from '@images/moana-1.png';
import ToyStoryPoster from '@images/toy-story-5-1.png';
import MinhaMelhorAmigaPoster from '@images/minha-melhor-amiga-1.png';
import { MovieListingCard, type MovieListingCardProps } from '@components/Common/MovieListingCard';
import { PageLoadingScreen, usePageLoadingScreen } from '@components/Common/PageLoadingScreen';
import { Button } from '@components/Common/Button';
import {
  DEFAULT_SALES_CUTOFF_MINUTES,
  isShowtimeAvailable,
  useShowtimeClock,
  type ShowtimeAvailability,
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
import { getMovieFilterGroups, getMovieFilterOptionIds, matchesMovieFilters, useMovieFilters, type FilterableMovie, type MovieFiltersPageProps } from '../movieFilters';
import { MoviesFilterOverlay } from '../MoviesFilterOverlay';
import { MovieSessionActionDialog, type MovieSessionNotice } from '../MovieSessionActionDialog';
import { requestCustomerHomeExit } from '@components/Overlays/CustomerHomeExitDialog';
import {
  getReleasedPreSaleMovies,
  hasPreSaleMovies,
  isWithinPremiereWindow,
  usePreSaleClock,
} from '../preSaleMovies';
import { CUSTOMER_FLOW_RESET_EVENT } from '../../customerFlowReset';
import type { MovieDetailsNavigationState } from '../movieNavigation';
import './MoviesNowPlayingPage.css';

type Movie = Pick<MovieListingCardProps, 'movieTitle' | 'originCountry' | 'duration' | 'posterImageUrl' | 'posterTagLabel' | 'posterRatingValue' | 'blocks'> & FilterableMovie & {
  releaseDate?: string;
};
const nowPlayingShowtimeDate = '2027-03-20';
const normal = { time: '10:00', state: 'Normal' as const, showtimeDate: nowPlayingShowtimeDate };
const occupied = (perc: number) => ({ time: '10:00', state: 'High' as const, perc, showtimeDate: nowPlayingShowtimeDate });
const remaining = (seats: number) => ({ time: '10:00', state: 'Critical' as const, seats, showtimeDate: nowPlayingShowtimeDate });

const movies: Movie[] = [
  { movieTitle: 'A Odisseia', posterImageUrl: AOdisseiaPoster, posterTagLabel: 'Estreia', posterRatingValue: '18', genre: 'Ação', releaseDate: '2027-03-20', filterValues: ['2D', '3D', 'Dublado', 'Legendado', 'VIP', 'Laser', 'Manhã'], blocks: [
    { tag1: 'Dub', tag2: '2D', auditorium: '5', experiences: [{ text: 'VIP' }, { text: 'Laser' }], showtimes: [normal, remaining(20), occupied(60)] },
    { tag1: 'Dub', tag2: '3D', auditorium: '6', experiences: [{ text: 'Laser' }], showtimes: [normal, occupied(60), remaining(12)] },
    { tag1: 'Leg', tag2: '3D', auditorium: '7', showtimes: [occupied(70), normal, remaining(8), remaining(20)] },
  ] },
  { movieTitle: 'Toy Story 5', posterImageUrl: ToyStoryPoster, posterTagLabel: '', posterRatingValue: '6', genre: 'Animação', filterValues: ['2D', 'Dublado', 'Laser', 'Manhã'], blocks: [
    { tag1: 'Dub', tag2: '2D', auditorium: '2', experiences: [{ text: 'Laser' }], showtimes: [normal, normal, normal] },
    { tag1: 'Dub', tag2: 'Azul', auditorium: '3', showtimes: [normal, occupied(60)] },
  ] },
  { movieTitle: 'Moana', posterImageUrl: MoanaPoster, posterTagLabel: '', posterRatingValue: '10', genre: 'Aventura', filterValues: ['2D', '3D', 'Dublado', 'VIP', 'Laser', 'Infinity Vision', 'Manhã'], blocks: [
    { tag1: 'Dub', tag2: '2D', auditorium: '4', experiences: [{ text: 'VIP' }, { text: 'Infinity Vision' }], showtimes: [normal, occupied(65), normal] },
    { tag1: 'Dub', tag2: '3D', auditorium: '8', experiences: [{ text: 'Laser' }], showtimes: [remaining(20), occupied(60), normal] },
  ] },
  { movieTitle: 'Minions & Monstros', posterImageUrl: MinionsMonstrosPoster, posterTagLabel: '', posterRatingValue: '10', genre: 'Animação', filterValues: ['2D', '3D', 'Dublado', 'Legendado', 'VIP', 'Laser', 'Manhã'], blocks: [
    { tag1: 'Dub', tag2: '2D', auditorium: '1', showtimes: [normal, occupied(60), remaining(20)] },
    { tag1: 'Dub', tag2: '3D', auditorium: '5', showtimes: [normal, occupied(75), normal] },
    { tag1: 'Leg', tag2: '3D', auditorium: '9', experiences: [{ text: 'VIP' }], showtimes: [remaining(20), normal, remaining(12)] },
  ] },
  { movieTitle: 'Águas Mortais', posterImageUrl: AguasMortaisPoster, posterTagLabel: '', posterRatingValue: '16', genre: 'Suspense', filterValues: ['2D', 'Dublado', 'Noite'], blocks: [
    { tag1: 'Dub', tag2: '2D', auditorium: '4', showtimes: [normal, occupied(60), normal] },
  ] },
  { movieTitle: 'Minha Melhor Amiga', originCountry: 'Brasil', duration: '119', posterImageUrl: MinhaMelhorAmigaPoster, posterTagLabel: '', posterRatingValue: '12', genre: 'Comédia', filterValues: ['2D', 'Original', 'Manhã'], blocks: [
    { tag1: 'Original', tag2: '2D', auditorium: '3', showtimes: [normal, occupied(60), remaining(18)] },
  ] },
];

const extendedShowtimes = Array.from({ length: 22 }, (_, index) => {
  const totalMinutes = (9 * 60) + (index * 30);
  const hour = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minute = (totalMinutes % 60).toString().padStart(2, '0');
  const time = `${hour}:${minute}`;

  if (index % 3 === 1) {
    return { time, state: 'Critical' as const, seats: 20 - (index % 10), showtimeDate: nowPlayingShowtimeDate };
  }
  if (index % 3 === 2) {
    return { time, state: 'High' as const, perc: 60 + (index % 30), showtimeDate: nowPlayingShowtimeDate };
  }
  return { time, state: 'Normal' as const, showtimeDate: nowPlayingShowtimeDate };
});

const moviesWithManySessions: Movie[] = movies.map((movie, movieIndex) => (
  movieIndex === 0
    ? {
        ...movie,
        blocks: movie.blocks?.map((block, blockIndex) => (
          blockIndex === 0 ? { ...block, showtimes: extendedShowtimes } : block
        )),
      }
    : movie
));

const icon = (Icon: ComponentType) => <Icon />;

function periodForTime(time: string) {
  const hour = Number.parseInt(time.split(':')[0] ?? '', 10);
  if (Number.isNaN(hour)) return '';
  if (hour < 12) return 'Manhã';
  if (hour < 18) return 'Tarde';
  return 'Noite';
}

function filterDetailedMovies(sourceMovies: readonly Movie[], activeFilters: readonly string[]) {
  if (activeFilters.length === 0) return [...sourceMovies];

  return sourceMovies
    .map((movie) => ({
      ...movie,
      blocks: movie.blocks?.filter((block) => {
        const blockValues = [
          movie.genre,
          block.tag1 === 'Dub' ? 'Dublado' : block.tag1 === 'Leg' ? 'Legendado' : block.tag1,
          block.tag2,
          ...(block.experiences ?? []).map((experience) => experience.text),
          ...(block.showtimes ?? []).map((showtime) => periodForTime(showtime.time)),
        ].filter((value): value is string => Boolean(value));
        return matchesMovieFilters(blockValues, activeFilters);
      }),
    }))
    .filter((movie) => (movie.blocks?.length ?? 0) > 0);
}

function filterAvailableMovies(
  sourceMovies: readonly Movie[],
  nowTimestamp: number,
  salesCutoffMinutes: number,
) {
  return sourceMovies
    .map((movie) => ({
      ...movie,
      blocks: (movie.blocks ?? [])
        .map((block) => ({
          ...block,
          showtimes: (block.showtimes ?? []).filter((showtime) => isShowtimeAvailable({
            time: showtime.time,
            showtimeDate: showtime.showtimeDate,
            salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
            availableSeats: showtime.seats,
          }, nowTimestamp, salesCutoffMinutes)),
        }))
        .filter((block) => block.showtimes.length > 0),
    }))
    .filter((movie) => movie.blocks.length > 0);
}

export type MoviesNowPlayingPageProps = MovieFiltersPageProps & {
  /** Network sales tolerance, kept outside the visible interface. */
  salesCutoffMinutes?: number;
  /** Deterministic clock override for tests and stories. */
  referenceTime?: Date | string;
  /** Final inventory validation performed when the user taps a visible session. */
  validateShowtime?: (showtime: ShowtimeAvailability) => boolean | Promise<boolean>;
  /** Displays one catalog block with an extended set of sessions. */
  manySessions?: boolean;
};

function TodaySessionsEnded({ onSeeTomorrow }: { onSeeTomorrow: () => void }) {
  const { t } = useI18n();
  return (
    <section
      className="movies-sessions-ended"
      aria-live="polite"
      aria-labelledby="movies-sessions-ended-title"
    >
      <span className="movies-sessions-ended__icon" aria-hidden="true">
        <InformationCircleIcon focusable="false" />
      </span>
      <div className="movies-sessions-ended__text">
        <h2 id="movies-sessions-ended-title">{t('movies.sessionsEndedTitle')}</h2>
        <p>{t('movies.sessionsEndedDescription')}</p>
      </div>
      <Button
        className="movies-sessions-ended__button"
        label={t('action.seeTomorrow')}
        intent="primary"
        variant="solid"
        radius="sm"
        showLeftIcon={false}
        showRightIcon={false}
        showSecondaryLabel={false}
        onClick={onSeeTomorrow}
      />
    </section>
  );
}

export function MoviesNowPlayingPage({
  salesCutoffMinutes = DEFAULT_SALES_CUTOFF_MINUTES,
  referenceTime,
  validateShowtime,
  manySessions = false,
  ...filterProps
}: MoviesNowPlayingPageProps) {
  const isPageLoading = usePageLoadingScreen();
  const orientation = useOrientation();
  const {
    showAuditorium,
    showExperienceBadges,
    ageRatingNotice,
    inclusiveSessionNotice,
    experienceLogoMode,
    selectedExperienceLogos,
  } = useFeaturePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { activeFilters, clearFilters, removeFilter, setFilters } = useMovieFilters(filterProps);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<MovieSessionNotice>(null);
  const startPurchase = () => navigate('/purchase/movies/tickets');
  const livePreSaleTimestamp = usePreSaleClock();
  const referenceTimestamp = referenceTime instanceof Date
    ? referenceTime.getTime()
    : referenceTime
      ? new Date(referenceTime).getTime()
      : Number.NaN;
  const preSaleNowTimestamp = Number.isNaN(referenceTimestamp)
    ? livePreSaleTimestamp
    : referenceTimestamp;
  const promotedMovies = getReleasedPreSaleMovies(preSaleNowTimestamp).map(({
    releaseDate,
    genre: _genre,
    duration: _duration,
    ...movie
  }) => ({
    ...movie,
    releaseDate,
    posterTagLabel: isWithinPremiereWindow(releaseDate, preSaleNowTimestamp) ? 'Estreia' : '',
  }));
  const catalogMovies = manySessions ? moviesWithManySessions : movies;
  const sourceMovies = [
    ...catalogMovies.map((movie) => ({
      ...movie,
      posterTagLabel: movie.posterTagLabel === 'Estreia' && movie.releaseDate
        ? (isWithinPremiereWindow(movie.releaseDate, preSaleNowTimestamp) ? 'Estreia' : '')
        : movie.posterTagLabel,
    })),
    ...promotedMovies.filter((promoted) => (
      !catalogMovies.some((movie) => movie.movieTitle === promoted.movieTitle)
    )),
  ];
  const allShowtimes = sourceMovies.flatMap((movie) => (
    movie.blocks ?? []
  ).flatMap((block) => (block.showtimes ?? []).map((showtime) => ({
    time: showtime.time,
    showtimeDate: showtime.showtimeDate,
    salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
    availableSeats: showtime.seats,
  }))));
  const liveShowtimeTimestamp = useShowtimeClock(allShowtimes, salesCutoffMinutes);
  const nowTimestamp = Number.isNaN(referenceTimestamp)
    ? liveShowtimeTimestamp
    : referenceTimestamp;
  const availableMovies = filterAvailableMovies(sourceMovies, nowTimestamp, salesCutoffMinutes);
  const filterGroups = getMovieFilterGroups(availableMovies);
  const availableFilterIds = getMovieFilterOptionIds(filterGroups);
  const filteredMovies = filterDetailedMovies(availableMovies, activeFilters);
  const showSessionsEnded = availableMovies.length === 0;
  const showEmptyState = !showSessionsEnded && activeFilters.length > 0 && filteredMovies.length === 0;
  const openMovieDetails = (movie: Movie) => navigate('/movies/details', {
    state: {
      movie,
      returnPath: `${location.pathname}${location.search}`,
    } satisfies MovieDetailsNavigationState,
  });

  useEffect(() => {
    const validFilters = activeFilters.filter((filter) => availableFilterIds.has(filter));
    if (validFilters.length !== activeFilters.length) setFilters(validFilters);
  }, [activeFilters, availableFilterIds, setFilters]);

  useEffect(() => {
    const resetPageState = () => {
      setIsAccessibilityOpen(false);
      setIsFilterOpen(false);
      setSessionNotice(null);
    };
    window.addEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
    return () => window.removeEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
  }, []);

  return (
    <div className={`page-wrapper page-wrapper--${orientation}${isPageLoading ? ' page-loading-active' : ''}`}>
      <Header
        context="Customer"
        type="Default"
        autoOpenIdentityPrompt
        onInitialModalAccessibility={() => setIsAccessibilityOpen(true)}
        initialModalAccessibilityOpen={isAccessibilityOpen}
      />
      <PageLoadingScreen active={isPageLoading} modalAbove />
      <div className="movies-page__shell">
        <Navbar className="movies-page__navbar" orientation={orientation}>
          <NavbarButton label={t('navigation.home')} icon={icon(HomeIcon)} selected={false} onClick={requestCustomerHomeExit} />
          <NavbarButton label={t('navigation.movies')} icon={icon(MoviesIcon)} selected onClick={() => navigate('/movies')} />
          <NavbarButton label={t('navigation.concessions')} icon={icon(PopcornIcon)} selected={false} onClick={() => navigate('/concessions')} />
          <NavbarButton label={t('navigation.accessibility')} icon={icon(AccessibilityIcon)} variant="Accessibility" onClick={() => setIsAccessibilityOpen(true)} />
        </Navbar>
        <main className="movies-page__main">
          <section className="movies-page__content" aria-labelledby="movies-page-title">
            <h1 id="movies-page-title">{t('movies.heading')}</h1>
            <MoviesPageFilters
              activeFilters={activeFilters}
              selectedTab={0}
              showPreSale={hasPreSaleMovies(preSaleNowTimestamp)}
              filterDisabled={showSessionsEnded}
              onRemoveFilter={removeFilter}
              onOpenFilters={() => setIsFilterOpen(true)}
            />
            {showSessionsEnded ? (
              <TodaySessionsEnded onSeeTomorrow={() => navigate('/movies/another-day')} />
            ) : showEmptyState ? (
              <MoviesEmptyState onClearFilters={clearFilters} />
            ) : (
              <div className="movies-page__list" aria-live="polite">
                {filteredMovies.map(({
                  filterValues: _filterValues,
                  releaseDate: _releaseDate,
                  ...movie
                }) => (
                  <MovieListingCard key={movie.movieTitle} type="Detailed"
                    orientation={orientation}
                    showAuditorium={showAuditorium}
                    showExperienceBadges={showExperienceBadges}
                    selectedExperienceLogos={experienceLogoMode === 'custom' ? selectedExperienceLogos : undefined}
                    salesCutoffMinutes={salesCutoffMinutes}
                    onPosterClick={() => openMovieDetails(movie)}
                    onShowtimeClick={async (block, showtime) => {
                      const selectedShowtime = {
                        time: showtime.time,
                        showtimeDate: showtime.showtimeDate,
                        salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
                        availableSeats: showtime.seats,
                      };
                      const isAvailable = isShowtimeAvailable(selectedShowtime)
                        && (validateShowtime ? await validateShowtime(selectedShowtime) : true);
                      if (!isAvailable) {
                        setSessionNotice('unavailable');
                        return;
                      }
                      if (ageRatingNotice && /^A?18$/i.test(movie.posterRatingValue ?? '')) {
                        setSessionNotice('age-18');
                        return;
                      }
                      const blockLabels = [block.tag1, block.tag2, ...(block.experiences ?? []).map((experience) => experience.text)];
                      if (inclusiveSessionNotice && blockLabels.some((label) => label.trim().toLocaleLowerCase('pt-BR') === 'azul')) {
                        setSessionNotice('blue');
                        return;
                      }
                      startPurchase();
                    }}
                    {...movie}
                  />
                ))}
              </div>
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
      <MoviesFilterOverlay
        open={isFilterOpen}
        orientation={orientation}
        groups={filterGroups}
        activeFilters={activeFilters}
        onApply={setFilters}
        onClose={() => setIsFilterOpen(false)}
      />
      <MovieSessionActionDialog
        notice={sessionNotice}
        orientation={orientation}
        onClose={() => setSessionNotice(null)}
        onContinue={startPurchase}
      />
    </div>
  );
}
