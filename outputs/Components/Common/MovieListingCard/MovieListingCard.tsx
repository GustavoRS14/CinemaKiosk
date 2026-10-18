import React from 'react';
import { MoviePoster } from '../MoviePoster';
import { Tag } from '../Tag';
import { ShowtimeCarousel } from '../ShowtimeCarousel';
import {
  ShowtimeButton,
  DEFAULT_SALES_CUTOFF_MINUTES,
  isShowtimeAvailable,
  useShowtimeClock,
} from '../ShowtimeButton';
import { Divider } from '../Divider';
import { ExperienceContainer } from '../ExperienceContainer';
import { ExperienceBadge, ExperienceType } from '../ExperienceBadge';
import placeholderImg from '@images/placeholder.png';
import { useI18n } from '../../../i18n';
import { formatMovieDuration } from '../formatMovieDuration';
import { localizeMovieGenre, resolveMovieLanguage } from '../movieLocalization';
import './MovieListingCard.css';

export interface ShowtimeData {
  time: string;
  state: 'High' | 'Normal' | 'Critical';
  perc?: number;
  seats?: number;
  showtimeDate?: Date | string;
  salesCutoffMinutes?: number;
}

export interface ShowtimeBlockData {
  tag1: string;
  tag2: string;
  auditorium?: string;
  experiences?: { text: string }[];
  showtimes?: ShowtimeData[];
}

export interface MovieListingCardProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  duration?: string;
  genre?: string;
  movieTitle?: string;
  originCountry?: string;
  posterImageUrl?: string;
  posterTagLabel?: string;
  posterRatingValue?: string;
  showAuditorium?: boolean;
  showExperienceBadges?: boolean;
  /** When provided, only these experiences use logos; the remaining ones stay as tags. */
  selectedExperienceLogos?: readonly string[];
  formatDurationToMinutes?: boolean;
  /** Default sales tolerance applied to every session that does not override it. */
  salesCutoffMinutes?: number;
  blocks?: ShowtimeBlockData[];
  type?: 'Detailed' | 'Simplified';
  onShowtimeClick?: (block: ShowtimeBlockData, showtime: ShowtimeData) => void;
  onPosterClick?: () => void;
  onClick?: () => void;
}

const mapToExperienceType = (text: string): ExperienceType | null => {
  const normalized = text.toLowerCase().trim();
  switch (normalized) {
    case 'dolby atmos': return 'Dolby Atmos';
    case '3d': return '3D';
    case 'imax': return 'IMAX';
    case 'laser': return 'Laser';
    case 'infinity vision': return 'Infinity Vision';
    case 'vip': return 'VIP';
    default: return null;
  }
};

const getPrimaryGenre = (genreStr: string): string => {
  if (!genreStr) return '';
  const parts = genreStr.split(/[,;\.\-\/\|\\&]|\s+[eE]\s+/);
  return parts[0].trim();
};

const defaultShowtimes: ShowtimeData[] = [
  { time: '10:00', state: 'High', perc: 60 },
  { time: '10:00', state: 'Normal' },
  { time: '10:00', state: 'Critical', seats: 20 },
  { time: '10:00', state: 'Normal' },
];

export const MovieListingCard: React.FC<MovieListingCardProps> = ({
  className = '',
  orientation = 'horizontal',
  duration = '90', 
  genre = 'Ação',
  movieTitle = 'A Odisseia',
  originCountry,
  posterImageUrl = placeholderImg,
  posterTagLabel = 'Estreia',
  posterRatingValue = '18',
  showAuditorium = false,
  showExperienceBadges = false,
  selectedExperienceLogos,
  formatDurationToMinutes = true,
  salesCutoffMinutes = DEFAULT_SALES_CUTOFF_MINUTES,
  blocks = [
    { tag1: 'Dub', tag2: '2D', auditorium: '5', experiences: [{ text: 'IMAX' }, { text: 'Laser' }, { text: 'Infinity Vision' }, { text: 'VIP' }], showtimes: defaultShowtimes },
    { tag1: 'Dub', tag2: '3D', auditorium: '6', experiences: [{ text: 'IMAX' }, { text: 'Laser' }, { text: 'Infinity Vision' }, { text: 'VIP' }], showtimes: defaultShowtimes },
    { tag1: 'Leg', tag2: '3D', auditorium: '7', experiences: [{ text: '3D' }], showtimes: defaultShowtimes }
  ],
  type = 'Detailed',
  onShowtimeClick,
  onPosterClick,
  onClick,
}) => {
  const { locale, t } = useI18n();
  const isDetailed = type === 'Detailed';
  const isSimplified = type === 'Simplified';
  const isPressed = false;
  const showtimeDescriptors = isDetailed
    ? blocks.flatMap((block) => (block.showtimes ?? []).map((showtime) => ({
      time: showtime.time,
      showtimeDate: showtime.showtimeDate,
      salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
      availableSeats: showtime.seats,
    })))
    : [];
  const nowTimestamp = useShowtimeClock(showtimeDescriptors, salesCutoffMinutes);
  const visibleBlocks = isDetailed
    ? blocks
      .map((block) => ({
        ...block,
        showtimes: (block.showtimes ?? []).filter((showtime) => isShowtimeAvailable({
          time: showtime.time,
          showtimeDate: showtime.showtimeDate,
          salesCutoffMinutes: showtime.salesCutoffMinutes ?? salesCutoffMinutes,
          availableSeats: showtime.seats,
        }, nowTimestamp, salesCutoffMinutes)),
      }))
      .filter((block) => block.showtimes.length > 0)
    : blocks;

  const cardClassName = `movie-listing-card movie-listing-card--${type.toLowerCase()} movie-listing-card--default ${className}`.trim();

  const renderTagsAndShowtimes = (
    blockIndex: number,
    tags: { label: string; status: 'Brand' | 'Information' | 'Warning' | 'Success' | 'Error' | 'Neutral' }[],
    auditorium?: string,
    showBadges?: boolean,
    blockExperiences?: { text: string }[],
    blockShowtimes?: ShowtimeData[],
    sourceBlock?: ShowtimeBlockData,
  ) => {
    const selfUnique = blockExperiences ? blockExperiences.filter((exp, idx, self) => 
      idx === self.findIndex(e => e.text.toLowerCase() === exp.text.toLowerCase())
    ) : [];

    const extraTagsToRender = selfUnique.filter(exp => 
      !tags.some(t => t.label.toLowerCase() === exp.text.toLowerCase())
    );

    const selectedLogoNames = selectedExperienceLogos
      ? new Set(selectedExperienceLogos.map((experience) => experience.toLocaleLowerCase('pt-BR')))
      : null;
    const usesLogo = (experience: string) => !selectedLogoNames
      || selectedLogoNames.has(experience.toLocaleLowerCase('pt-BR'));

    const badgesToRender = selfUnique.filter(exp => {
      if (!usesLogo(exp.text)) return false;
      if (exp.text.toLowerCase() === '3d') return true;
      return !tags.some(t => t.label.toLowerCase() === exp.text.toLowerCase());
    });

    const exactBadgesToRender = badgesToRender
      .map(exp => mapToExperienceType(exp.text))
      .filter((badge): badge is ExperienceType => badge !== null);

    if (usesLogo('3D') && tags.some(t => t.label.toLowerCase() === '3d') && !exactBadgesToRender.includes('3D')) {
      exactBadgesToRender.push('3D');
    }

    const fallbackExperienceTags = showBadges
      ? extraTagsToRender.filter((experience) => !usesLogo(experience.text))
      : extraTagsToRender;

    const isOnly3D = exactBadgesToRender.length === 1 && exactBadgesToRender[0] === '3D';
    const containerFormat = isOnly3D ? '3D' : 'Premium';

    const currentShowtimes = blockShowtimes || [];

    return (
      <div className="movie-listing-card__showtimes-block">
        <div className="movie-listing-card__tags-row">
          {tags.map((t, idx) => (
            <Tag key={`default-${idx}`} text={t.label} status={t.status as any} />
          ))}
          
          {fallbackExperienceTags.map((exp, idx) => (
            <Tag key={`extra-${idx}`} text={exp.text} status="Information" />
          ))}

          {showAuditorium && auditorium && (
            <div className="movie-listing-card__auditorium">
              <span>{t('movie.auditorium')}</span>
              <span>{auditorium}</span>
            </div>
          )}
        </div>

        {showBadges && exactBadgesToRender.length > 0 && (
          <div className="movie-listing-card__experience-wrapper">
            <ExperienceContainer format={containerFormat}>
              {exactBadgesToRender.map((badge, idx) => (
                <ExperienceBadge key={`${badge}-${idx}`} experience={badge} />
              ))}
            </ExperienceContainer>
          </div>
        )}

        <ShowtimeCarousel className="movie-listing-card__carousel" orientation={orientation}>
          {currentShowtimes.map((st, i) => (
            <ShowtimeButton
              key={`showtime-block-${blockIndex}-index-${i}`}
              time={st.time}
              occupancyState={st.state}
              occupancyPercentage={st.perc}
              availableSeats={st.seats}
              showtimeDate={st.showtimeDate}
              salesCutoffMinutes={st.salesCutoffMinutes ?? salesCutoffMinutes}
              onClick={() => sourceBlock && onShowtimeClick?.(sourceBlock, st)}
            />
          ))}
        </ShowtimeCarousel>
      </div>
    );
  };

  if (isDetailed && visibleBlocks.length === 0) return null;

  return (
    <div
      className={cardClassName}
      data-state="Default"
      data-type={type}
      role={isSimplified && onClick ? 'button' : undefined}
      tabIndex={isSimplified && onClick ? 0 : undefined}
      onClick={isSimplified ? onClick : undefined}
      onKeyDown={isSimplified && onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
    >
      
      {isSimplified ? (
        <MoviePoster
          className="movie-listing-card__poster-simplified"
          imageUrl={posterImageUrl}
          movieTitle={movieTitle}
          showTag={true}
          tagLabel={posterTagLabel}
          showRating={true}
          ratingValue={posterRatingValue as any}
          isInteractive={true}
          onClick={onPosterClick}
        />
      ) : (
        <MoviePoster
          className="movie-listing-card__poster-detailed"
          imageUrl={posterImageUrl}
          movieTitle={movieTitle}
          showTag={true}
          tagLabel={posterTagLabel}
          showRating={true}
          ratingValue={posterRatingValue as any}
          isInteractive={true}
          onClick={onPosterClick}
        />
      )}
      
      <div className="movie-listing-card__main-content">
        {isDetailed && (
          <>
            <div className="movie-listing-card__title-row">
              <span className="movie-listing-card__title">{movieTitle}</span>
            </div>

            <div className="movie-listing-card__showtimes-container">
              {visibleBlocks.map((block, index) => (
                <React.Fragment key={`block-${index}`}>
                  {index > 0 && <Divider className="movie-listing-card__divider" />}
                  {/* CRITICAL FIX: Normalizing block.tag1 before passing to the tag component */}
                  {renderTagsAndShowtimes(
                    index + 1,
                    [
                      { label: t(resolveMovieLanguage(block.tag1, originCountry, locale)), status: 'Brand' },
                      { label: block.tag2, status: 'Information' }
                    ],
                    block.auditorium,
                    showExperienceBadges,
                    block.experiences,
                    block.showtimes,
                    block,
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {isSimplified && (
          <div className="movie-listing-card__simplified-info">
            <span className="movie-listing-card__title">{movieTitle}</span>
            <div className="movie-listing-card__meta" style={{ width: '100%', minWidth: 0 }}>
              <span 
                title={localizeMovieGenre(getPrimaryGenre(genre), t)} 
                style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap', 
                  flexShrink: 1, 
                  minWidth: 0 
                }}
              >
                {localizeMovieGenre(getPrimaryGenre(genre), t)}
              </span>
              <span style={{ flexShrink: 0 }}>|</span>
              <span style={{ flexShrink: 0 }}>{formatMovieDuration(duration, formatDurationToMinutes, locale)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
