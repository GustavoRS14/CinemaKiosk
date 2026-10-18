import type { MovieListingCardProps } from '@components/Common/MovieListingCard';

export type MovieDetailsSelection = Pick<
  MovieListingCardProps,
  | 'movieTitle'
  | 'originCountry'
  | 'duration'
  | 'genre'
  | 'posterImageUrl'
  | 'posterTagLabel'
  | 'posterRatingValue'
  | 'blocks'
>;

export type MovieDetailsNavigationState = {
  movie: MovieDetailsSelection;
  returnPath: string;
};

export type MoviePurchaseNavigationState = MovieDetailsNavigationState & {
  purchaseOrigin: 'movie-details';
  movieDetailsPath: string;
};

