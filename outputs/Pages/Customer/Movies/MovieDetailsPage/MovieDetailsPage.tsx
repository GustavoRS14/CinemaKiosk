import { Fragment, useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccessibilityIcon from '@icons/accessibility.svg';
import HomeIcon from '@icons/home.svg';
import MoviesIcon from '@icons/video.svg';
import PopcornIcon from '@icons/popcorn.svg';
import AOdisseiaPoster from '@images/a-odisseia-2.png';
import { Button } from '@components/Common/Button';
import { DateCarousel } from '@components/Common/DateCarousel';
import { Divider } from '@components/Common/Divider';
import { ExperienceBadge, type ExperienceType } from '@components/Common/ExperienceBadge';
import { ExperienceContainer } from '@components/Common/ExperienceContainer';
import { Legend } from '@components/Common/Legend';
import { MovieOverview } from '@components/Common/MovieOverview/MovieOverview';
import { PageLoadingScreen, usePageLoadingScreen } from '@components/Common/PageLoadingScreen';
import {
  ShowtimeButton,
  DEFAULT_SALES_CUTOFF_MINUTES,
  isShowtimeAvailable,
  useShowtimeClock,
  type ShowtimeAvailability,
  type ShowtimeButtonProps,
} from '@components/Common/ShowtimeButton';
import { Tag } from '@components/Common/Tag';
import { resolveMovieLanguage } from '@components/Common/movieLocalization';
import { Header } from '@components/Layout/Header';
import { Navbar } from '@components/Layout/Navbar';
import { NavbarButton } from '@components/Layout/Navbar/NavbarButton';
import { useFeaturePreferences } from '../../../featurePreferences';
import { useOrientation } from '../../../useOrientation';
import { useI18n } from '../../../../i18n';
import { CustomerAccessibilityOverlay } from '../../CustomerAccessibilityOverlay';
import { CustomerConcessionCart } from '../../Concessions/CustomerConcessionCart';
import { MovieSessionActionDialog, type MovieSessionNotice } from '../MovieSessionActionDialog';
import { requestCustomerHomeExit } from '@components/Overlays/CustomerHomeExitDialog';
import type {
  MovieDetailsNavigationState,
  MoviePurchaseNavigationState,
} from '../movieNavigation';
import './MovieDetailsPage.css';

export type MovieDetailsDate = {
  day: string;
  date: string;
  month: string;
  isoDate: string;
};

const defaultAvailableDates: MovieDetailsDate[] = [
  { day: 'Sáb', date: '20', month: 'Mar', isoDate: '2027-03-20' },
  { day: 'Dom', date: '21', month: 'Mar', isoDate: '2027-03-21' },
  { day: 'Seg', date: '22', month: 'Mar', isoDate: '2027-03-22' },
  { day: 'Ter', date: '23', month: 'Mar', isoDate: '2027-03-23' },
  { day: 'Qua', date: '24', month: 'Mar', isoDate: '2027-03-24' },
  { day: 'Qui', date: '25', month: 'Mar', isoDate: '2027-03-25' },
  { day: 'Sex', date: '26', month: 'Mar', isoDate: '2027-03-26' },
];

type ShowtimeGroup = {
  auditorium: string;
  tags: string[];
  showtimes: Array<Pick<
    ShowtimeButtonProps,
    'time' | 'occupancyState' | 'occupancyPercentage' | 'availableSeats' | 'salesCutoffMinutes'
  >>;
};

const defaultShowtimeGroups: ShowtimeGroup[] = [
  {
    auditorium: '5',
    tags: ['Dublado', '2D', 'Laser'],
    showtimes: [
      { time: '10:00', occupancyState: 'Normal' },
      { time: '11:30', occupancyState: 'Critical', availableSeats: 20 },
      { time: '13:00', occupancyState: 'High', occupancyPercentage: 60 },
      { time: '15:30', occupancyState: 'Normal' },
      { time: '18:00', occupancyState: 'Normal' },
      { time: '20:30', occupancyState: 'High', occupancyPercentage: 70 },
      { time: '23:00', occupancyState: 'Critical', availableSeats: 2 },
    ],
  },
  {
    auditorium: '6',
    tags: ['Dublado', '3D', 'VIP'],
    showtimes: [
      { time: '10:30', occupancyState: 'Normal' },
      { time: '13:30', occupancyState: 'High', occupancyPercentage: 60 },
      { time: '16:00', occupancyState: 'Critical', availableSeats: 12 },
      { time: '19:00', occupancyState: 'Critical', availableSeats: 12 },
      { time: '22:30', occupancyState: 'Normal' },
    ],
  },
  {
    auditorium: '7',
    tags: ['Legendado', '3D'],
    showtimes: [
      { time: '12:00', occupancyState: 'High', occupancyPercentage: 70 },
      { time: '15:00', occupancyState: 'Normal' },
      { time: '18:30', occupancyState: 'Critical', availableSeats: 8 },
      { time: '21:30', occupancyState: 'Normal' },
    ],
  },
];

const icon = (Icon: ComponentType | string) =>
  typeof Icon === 'string' ? <img src={Icon} alt="" aria-hidden="true" /> : <Icon />;

export type MovieDetailsPageProps = {
  salesCutoffMinutes?: number;
  availableDates?: readonly MovieDetailsDate[];
  showtimeGroups?: readonly ShowtimeGroup[];
  originCountry?: string;
  /** Final inventory validation performed when the user taps a visible session. */
  validateShowtime?: (showtime: ShowtimeAvailability) => boolean | Promise<boolean>;
};

export function MovieDetailsPage({
  salesCutoffMinutes = DEFAULT_SALES_CUTOFF_MINUTES,
  availableDates = defaultAvailableDates,
  showtimeGroups = defaultShowtimeGroups,
  originCountry,
  validateShowtime,
}: MovieDetailsPageProps) {
  const isPageLoading = usePageLoadingScreen();
  const orientation = useOrientation();
  const {
    showAuditorium,
    showExperienceBadges,
    formatDurationToMinutes,
    ageRatingNotice,
    inclusiveSessionNotice,
    experienceLogoMode,
    selectedExperienceLogos,
  } = useFeaturePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as MovieDetailsNavigationState | null;
  const selectedMovie = navigationState?.movie;
  const { locale, t } = useI18n();
  const [selectedDateKey, setSelectedDateKey] = useState(() => availableDates[0]?.isoDate ?? '');
  const [fabLeft, setFabLeft] = useState<number>();
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<MovieSessionNotice>(null);
  const startPurchase = () => navigate('/purchase/movies/tickets', {
    state: navigationState ? {
      ...navigationState,
      purchaseOrigin: 'movie-details',
      movieDetailsPath: `${location.pathname}${location.search}`,
    } satisfies MoviePurchaseNavigationState : undefined,
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedMovieShowtimeGroups: ShowtimeGroup[] = (selectedMovie?.blocks ?? []).map((block) => ({
    auditorium: block.auditorium ?? '',
    tags: [block.tag1, block.tag2, ...(block.experiences ?? []).map((experience) => experience.text)],
    showtimes: (block.showtimes ?? []).map((showtime) => ({
      time: showtime.time,
      occupancyState: showtime.state,
      occupancyPercentage: showtime.perc,
      availableSeats: showtime.seats,
      salesCutoffMinutes: showtime.salesCutoffMinutes,
    })),
  }));
  const effectiveShowtimeGroups = selectedMovieShowtimeGroups.length > 0
    ? selectedMovieShowtimeGroups
    : showtimeGroups;
  const scheduleDescriptors = availableDates.flatMap(({ isoDate }) => effectiveShowtimeGroups
    .flatMap((group) => group.showtimes.map((showtime) => ({
      time: showtime.time ?? '10:00',
      showtimeDate: isoDate,
      salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
      availableSeats: showtime.availableSeats,
    }))));
  const nowTimestamp = useShowtimeClock(scheduleDescriptors, salesCutoffMinutes);
  const groupsForDate = (isoDate: string) => effectiveShowtimeGroups
    .map((group) => ({
      ...group,
      showtimes: group.showtimes.filter((showtime) => isShowtimeAvailable({
        time: showtime.time ?? '10:00',
        showtimeDate: isoDate,
        salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
        availableSeats: showtime.availableSeats,
      }, nowTimestamp, salesCutoffMinutes)),
    }))
    .filter((group) => group.showtimes.length > 0);
  const visibleDates = availableDates.filter(({ isoDate }) => groupsForDate(isoDate).length > 0);
  const selectedDate = visibleDates.find(({ isoDate }) => isoDate === selectedDateKey) ?? visibleDates[0];
  const visibleGroups = selectedDate ? groupsForDate(selectedDate.isoDate) : [];

  useEffect(() => {
    if (selectedDate && selectedDate.isoDate !== selectedDateKey) {
      setSelectedDateKey(selectedDate.isoDate);
    }
  }, [selectedDate, selectedDateKey]);

  useEffect(() => {
    const syncFabWithContent = () => {
      if (contentRef.current) setFabLeft(contentRef.current.getBoundingClientRect().left);
    };

    syncFabWithContent();
    window.addEventListener('resize', syncFabWithContent, { passive: true });
    const observer = new ResizeObserver(syncFabWithContent);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => {
      window.removeEventListener('resize', syncFabWithContent);
      observer.disconnect();
    };
  }, [orientation]);

  const pageStyle = fabLeft === undefined
    ? undefined
    : ({ '--movie-details-fab-left': `${fabLeft}px` } as CSSProperties);

  return (
    <div className={`movie-details-page movie-details-page--${orientation}${isPageLoading ? ' page-loading-active' : ''}`} style={pageStyle}>
      <Header context="Customer" type="Default" />
      <PageLoadingScreen active={isPageLoading} />

      <div className="movie-details-page__shell">
        <Navbar className="movie-details-page__navbar" orientation={orientation}>
          <NavbarButton label={t('navigation.home')} icon={icon(HomeIcon)} selected={false} onClick={requestCustomerHomeExit} />
          <NavbarButton label={t('navigation.movies')} icon={icon(MoviesIcon)} selected onClick={() => navigate('/movies')} />
          <NavbarButton label={t('navigation.concessions')} icon={icon(PopcornIcon)} selected={false} onClick={() => navigate('/concessions')} />
          <NavbarButton
            label={t('navigation.accessibility')}
            icon={icon(AccessibilityIcon)}
            variant="Accessibility"
            onClick={() => setIsAccessibilityOpen(true)}
          />
        </Navbar>

        <main className="movie-details-page__main">
          <div ref={contentRef} className="movie-details-page__content">
            <MovieOverview
              imageUrl={selectedMovie?.posterImageUrl ?? AOdisseiaPoster}
              movieTitle={selectedMovie?.movieTitle ?? 'A Odisséia'}
              genre={selectedMovie?.genre ?? 'Aventura'}
              duration={selectedMovie?.duration ?? '180'}
              formatDurationToMinutes={formatDurationToMinutes}
              synopsis="Acompanhe a saga de Odisseu, o lendário rei de Ítaca, em sua longa e perigosa jornada de retorno ao lar após a Guerra de Troia. O relato narra seus confrontos com seres míticos, como o ciclope Polifemo, as sedutoras sereias e a ninfa Calipso, enquanto ele luta contra o destino para se reencontrar com sua fiel esposa, Penélope."
              cast={['Matt Damon', 'Tom Holland', 'Anne Hathaway', 'Robert Pattinson', 'Himesh Patel', 'John Leguizamo', 'Charlize Theron']}
              showPosterTag
              posterTagLabel={selectedMovie?.posterTagLabel ?? 'Estreia'}
              showPosterRating
              posterRatingValue={(selectedMovie?.posterRatingValue ?? '18') as 'L' | '6' | '10' | '12' | '14' | '16' | '18'}
            />

            <section className="movie-details-page__sessions" aria-labelledby="movie-details-dates-title">
              <div className="movie-details-page__date-selector">
                <h1 id="movie-details-dates-title">{t('movies.availableDates')}</h1>
                <DateCarousel
                  className="movie-details-page__dates"
                  ariaLabel={t('movies.availableDatesAria')}
                  items={visibleDates.map(({ isoDate, ...date }) => ({ id: isoDate, ...date }))}
                  selectedId={selectedDate?.isoDate}
                  onSelect={setSelectedDateKey}
                />
              </div>

              <div className="movie-details-page__showtime-groups">
                {visibleGroups.map((group, groupIndex) => (
                  <Fragment key={group.tags.join('-')}>
                    {groupIndex > 0 && <Divider className="movie-details-page__showtime-divider" />}
                    <div className="movie-details-page__showtime-group">
                      <div className="movie-details-page__tags">
                        {(showExperienceBadges
                          ? [
                            ...group.tags.slice(0, 2),
                            ...(experienceLogoMode === 'custom'
                              ? group.tags.slice(1).filter((tag, index, tags) => (
                                !selectedExperienceLogos.some((selected) => selected.toLocaleLowerCase('pt-BR') === tag.toLocaleLowerCase('pt-BR'))
                                && !group.tags.slice(0, 2).some((baseTag) => baseTag.toLocaleLowerCase('pt-BR') === tag.toLocaleLowerCase('pt-BR'))
                                && tags.findIndex((candidate) => candidate.toLocaleLowerCase('pt-BR') === tag.toLocaleLowerCase('pt-BR')) === index
                              ))
                              : []),
                          ]
                          : group.tags
                        ).map((tag, tagIndex) => (
                          <Tag
                            key={tag}
                            status={tagIndex === 0 ? 'Brand' : 'Information'}
                            text={tagIndex === 0 ? t(resolveMovieLanguage(tag, selectedMovie?.originCountry ?? originCountry, locale)) : tag}
                          />
                        ))}
                        {showAuditorium && (
                          <span className="movie-details-page__auditorium">
                            <span>{t('movie.auditorium')}</span>
                            <span>{group.auditorium}</span>
                          </span>
                        )}
                      </div>
                      {showExperienceBadges && (() => {
                        const experiences = group.tags.slice(1)
                          .map((tag) => ({ '3D': '3D', Laser: 'Laser', VIP: 'VIP', IMAX: 'IMAX', 'Infinity Vision': 'Infinity Vision', 'Dolby Atmos': 'Dolby Atmos' }[tag] as ExperienceType | undefined))
                          .filter((experience): experience is ExperienceType => Boolean(experience))
                          .filter((experience) => experienceLogoMode !== 'custom'
                            || selectedExperienceLogos.some((selected) => selected.toLocaleLowerCase('pt-BR') === experience.toLocaleLowerCase('pt-BR')));
                        if (!experiences.length) return null;
                        return (
                          <ExperienceContainer
                            className="movie-details-page__experiences"
                            format={experiences.length === 1 && experiences[0] === '3D' ? '3D' : 'Premium'}
                          >
                            {experiences.map((experience) => <ExperienceBadge key={experience} experience={experience} />)}
                          </ExperienceContainer>
                        );
                      })()}
                      <div className="movie-details-page__showtimes">
                        {group.showtimes.map((showtime, index) => (
                          <ShowtimeButton
                            key={`${groupIndex}-${index}`}
                            time={showtime.time}
                            showtimeDate={selectedDate?.isoDate}
                            salesCutoffMinutes={showtime.salesCutoffMinutes ?? salesCutoffMinutes}
                            occupancyState={showtime.occupancyState}
                            occupancyPercentage={showtime.occupancyPercentage}
                            availableSeats={showtime.availableSeats}
                            selectable={false}
                            onClick={async () => {
                              const selectedShowtime = {
                                time: showtime.time ?? '10:00',
                                showtimeDate: selectedDate?.isoDate,
                                salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
                                availableSeats: showtime.availableSeats,
                              };
                              const isAvailable = isShowtimeAvailable(selectedShowtime)
                                && (validateShowtime ? await validateShowtime(selectedShowtime) : true);
                              if (!isAvailable) {
                                setSessionNotice('unavailable');
                                return;
                              }
                              if (inclusiveSessionNotice && group.tags.some((tag) => tag.trim().toLocaleLowerCase('pt-BR') === 'azul')) {
                                setSessionNotice('blue');
                              } else if (ageRatingNotice) {
                                setSessionNotice('age-18');
                              } else {
                                startPurchase();
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>

              <div className="movie-details-page__legend" aria-label={t('movie.roomsLegendAria')}>
                <section className="movie-details-page__legend-category" aria-labelledby="rooms-legend-title">
                  <h2 id="rooms-legend-title">{t('movie.rooms')}</h2>
                  <div className="movie-details-page__legend-items">
                    <Legend indicatorElement={<Tag status="Information" text="VIP" />} description={t('movie.vipDescription')} />
                    <Legend indicatorElement={<Tag status="Information" text="Laser" />} description={t('movie.laserDescription')} />
                  </div>
                </section>
                <Divider vertical className="movie-details-page__legend-divider" />
                <section className="movie-details-page__legend-category" aria-labelledby="sessions-legend-title">
                  <h2 id="sessions-legend-title">{t('movie.sessions')}</h2>
                  <div className="movie-details-page__legend-items">
                    <Legend indicatorElement={<Tag status="Information" text="2D" />} description={t('movie.2dDescription')} />
                    <Legend indicatorElement={<Tag status="Information" text="3D" />} description={t('movie.3dDescription')} />
                    <Legend indicatorElement={<Tag status="Information" text="Azul" />} description={t('movie.blueDescription')} />
                  </div>
                </section>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Button
        className="movie-details-page__fab"
        intent="primary"
        variant="subtle"
        radius="xl"
        label={t('action.back')}
        showLeftIcon={false}
        showRightIcon={false}
        showSecondaryLabel={false}
        onClick={() => navigationState?.returnPath ? navigate(navigationState.returnPath) : navigate(-1)}
      />
      <CustomerConcessionCart orientation={orientation} />
      <CustomerAccessibilityOverlay
        open={isAccessibilityOpen}
        orientation={orientation}
        onClose={() => setIsAccessibilityOpen(false)}
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
