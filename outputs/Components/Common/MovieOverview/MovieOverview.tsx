import React from 'react';
import { MoviePoster } from '../MoviePoster';
import './MovieOverview.css';
import { formatMovieDuration } from '../formatMovieDuration';
import { useI18n } from '../../../i18n';
import { localizeMovieGenre } from '../movieLocalization';

export interface MovieOverviewProps {
  /**
   * The source URL of the movie poster image.
   */
  imageUrl: string;
  /**
   * The title of the movie.
   */
  movieTitle: string;
  /**
   * The genre of the movie.
   */
  genre: string;
  /**
   * The duration of the movie.
   */
  duration: string;
  formatDurationToMinutes?: boolean;
  /**
   * The synopsis of the movie.
   */
  synopsis: string;
  /**
   * The list of actors/actresses.
   */
  cast?: string[];
  showPosterTag?: boolean;
  posterTagLabel?: string;
  showPosterRating?: boolean;
  posterRatingValue?: React.ComponentProps<typeof MoviePoster>['ratingValue'];
}

export const MovieOverview: React.FC<MovieOverviewProps> = ({
  imageUrl,
  movieTitle,
  genre,
  duration,
  formatDurationToMinutes = true,
  synopsis,
  cast,
  showPosterTag = false,
  posterTagLabel = 'Estreia',
  showPosterRating = false,
  posterRatingValue = '18',
}) => {
  const { locale, t } = useI18n();
  return (
    <div className="movie-overview">
      <div className="movie-overview__poster">
        <MoviePoster 
          imageUrl={imageUrl} 
          movieTitle={movieTitle} 
          showTag={showPosterTag}
          tagLabel={posterTagLabel}
          showRating={showPosterRating}
          ratingValue={posterRatingValue}
        />
      </div>

      <div className="movie-overview__content">
        <h2 className="movie-overview__title">{movieTitle}</h2>
        
        <div className="movie-overview__tags">
          <span className="movie-overview__tag-text">{localizeMovieGenre(genre, t)}</span>
          <span className="movie-overview__tag-text">|</span>
          <span className="movie-overview__tag-text">{formatMovieDuration(duration, formatDurationToMinutes, locale)}</span>
        </div>

        <p className="movie-overview__synopsis">{synopsis}</p>

        {cast && cast.length > 0 && (
          <div className="movie-overview__cast">
            <span className="movie-overview__cast-label">{t('movie.cast')}:</span>
            <span className="movie-overview__cast-text">
              {cast.join('; ')}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
