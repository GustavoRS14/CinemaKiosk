import MarsupilamiPoster from '@images/marsupilami-pre-sale.png';
import SpiderManPoster from '@images/spider-man-new-day-pre-sale.png';
import type { MovieListingCardProps } from '@components/Common/MovieListingCard';
import { useShowtimeClock } from '@components/Common/ShowtimeButton';
import type { FilterableMovie } from './movieFilters';

export type PreSaleMovie = Pick<
  MovieListingCardProps,
  'duration' | 'genre' | 'movieTitle' | 'posterImageUrl' | 'posterTagLabel' | 'posterRatingValue' | 'blocks'
> & FilterableMovie & {
  /** Local calendar date on which the movie leaves pre-sale. */
  releaseDate: string;
};

export const preSaleMovies: PreSaleMovie[] = [
  {
    movieTitle: 'Marsupilami: Confusão a Bordo',
    posterImageUrl: MarsupilamiPoster,
    posterTagLabel: '23/03/2027',
    posterRatingValue: '12',
    genre: 'Aventura',
    duration: '180',
    releaseDate: '2027-03-23',
    filterValues: ['2D', 'Dublado', 'Laser', 'Tarde'],
    blocks: [
      {
        tag1: 'Dub',
        tag2: '2D',
        auditorium: '2',
        experiences: [{ text: 'Laser' }],
        showtimes: [
          { time: '22:00', state: 'Normal' },
          { time: '23:30', state: 'Critical', seats: 20 },
        ],
      },
    ],
  },
  {
    movieTitle: 'Homem-Aranha: Um Novo Dia',
    posterImageUrl: SpiderManPoster,
    posterTagLabel: '23/03/2027',
    posterRatingValue: '14',
    genre: 'Ação',
    duration: '180',
    releaseDate: '2027-03-23',
    filterValues: ['3D', 'Legendado', 'IMAX', 'Noite'],
    blocks: [
      {
        tag1: 'Leg',
        tag2: '3D',
        auditorium: '7',
        experiences: [{ text: 'IMAX' }],
        showtimes: [
          { time: '22:15', state: 'High', perc: 60 },
          { time: '23:30', state: 'Normal' },
        ],
      },
    ],
  },
];

function releaseTimestamp(releaseDate: string) {
  const match = releaseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return Number.POSITIVE_INFINITY;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
}

const PREMIERE_TAG_DURATION_DAYS = 7;

export function isWithinPremiereWindow(
  releaseDate: string,
  nowTimestamp = Date.now(),
) {
  const premiereTimestamp = releaseTimestamp(releaseDate);
  if (!Number.isFinite(premiereTimestamp)) return false;

  const tagExpiration = new Date(premiereTimestamp);
  tagExpiration.setDate(tagExpiration.getDate() + PREMIERE_TAG_DURATION_DAYS);

  return nowTimestamp >= premiereTimestamp && nowTimestamp < tagExpiration.getTime();
}

function comparePreSaleMovies(first: PreSaleMovie, second: PreSaleMovie) {
  const dateDifference = releaseTimestamp(first.releaseDate) - releaseTimestamp(second.releaseDate);
  if (dateDifference !== 0) return dateDifference;

  return (first.movieTitle ?? '').localeCompare(second.movieTitle ?? '', 'pt-BR', {
    sensitivity: 'base',
  });
}

export function getUpcomingPreSaleMovies(nowTimestamp = Date.now()) {
  return preSaleMovies
    .filter((movie) => nowTimestamp < releaseTimestamp(movie.releaseDate))
    .sort(comparePreSaleMovies);
}

export function getReleasedPreSaleMovies(nowTimestamp = Date.now()) {
  return preSaleMovies.filter((movie) => nowTimestamp >= releaseTimestamp(movie.releaseDate));
}

export function hasPreSaleMovies(nowTimestamp = Date.now()) {
  return getUpcomingPreSaleMovies(nowTimestamp).length > 0;
}

/** Re-renders consumers exactly when the next pre-sale reaches its release date. */
export function usePreSaleClock() {
  return useShowtimeClock(preSaleMovies.map((movie) => ({
    time: '00:00',
    showtimeDate: movie.releaseDate,
    salesCutoffMinutes: 0,
  })), 0);
}
