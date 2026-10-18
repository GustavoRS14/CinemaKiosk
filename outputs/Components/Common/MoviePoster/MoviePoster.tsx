import React from 'react';
import { Tag } from '../Tag';
import { RatingAge, RatingAgeVariant } from '../RatingAge';
import './MoviePoster.css';
import { useI18n } from '../../../i18n';

export interface MoviePosterProps {
  /** Optional custom class name */
  className?: string;
  /**
   * The source URL of the movie poster image.
   */
  imageUrl: string;
  /**
   * The title of the movie, used for the image alt attribute.
   */
  movieTitle: string;
  /**
   * Whether to show the tag on the top left.
   */
  showTag?: boolean;
  /**
   * The label text for the tag.
   */
  tagLabel?: string;
  /**
   * Whether to show the rating age on the top right.
   */
  showRating?: boolean;
  /**
   * The rating variant to display.
   */
  ratingValue?: RatingAgeVariant;
  /**
   * Whether the poster is interactive (clickable).
   */
  isInteractive?: boolean;
  onClick?: () => void;
}

export const MoviePoster: React.FC<MoviePosterProps> = ({
  className = '',
  imageUrl,
  movieTitle,
  showTag = false,
  tagLabel = 'Estreia',
  showRating = false,
  ratingValue = '18',
  isInteractive = false,
  onClick,
}) => {
  const { t } = useI18n();
  const resolvedTagLabel = tagLabel.trim().toLocaleLowerCase('pt-BR') === 'estreia'
    ? t('movie.premiere')
    : tagLabel;
  return (
    <div
      className={`movie-poster ${className}`.trim()}
      data-interactive={isInteractive}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <img src={imageUrl} alt={movieTitle} className="movie-poster__image" />
      <div className="movie-poster__overlay">
        {showTag && resolvedTagLabel.trim() !== '' ? <Tag text={resolvedTagLabel} /> : <div />}
        {showRating && <RatingAge rating={ratingValue} />}
      </div>
      <div className="movie-poster__interactive-layer"></div>
    </div>
  );
};
