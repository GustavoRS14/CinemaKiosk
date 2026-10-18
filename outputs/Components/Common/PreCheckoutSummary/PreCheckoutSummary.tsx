import React from 'react';
import { MoviePoster } from '../MoviePoster';
import { Tag } from '../Tag';
import { RatingAgeVariant } from '../RatingAge';
import placeholderImg from '@images/placeholder.png';
import { translate, useI18n, type AppLocale } from '../../../i18n';
import './PreCheckoutSummary.css';
import { formatMovieDuration } from '../formatMovieDuration';
import { formatLocalizedShowtime, localizeMovieGenre, localizeSeatTag, resolveMovieLanguage } from '../movieLocalization';

export interface PreCheckoutSummaryProps {
  className?: string;
  movieName?: string;
  originCountry?: string;
  genre?: string;
  duration?: string;
  date?: string;
  startTime?: string;
  trailerDuration?: string;
  showEndTime?: boolean;
  auditorium?: string;
  
  language?: string;
  experiences?: string[];
  selectedSeats?: string[];
  showSelectedSeats?: boolean;
  selectedTickets?: string[];
  
  numberOfTickets?: string;
  showSelectedTickets?: boolean;
  formatDurationToMinutes?: boolean;
  
  posterImageUrl?: string;
  posterTagLabel?: string;
  posterRatingValue?: RatingAgeVariant;
  showPosterTag?: boolean;
  showPosterRating?: boolean;
}

const getPrimaryGenre = (genreStr: string): string => {
  if (!genreStr) return '';
  const parts = genreStr.split(/[,;\.\-\/\|\\&]|\s+[eE]\s+/);
  return parts[0].trim();
};

const calculateEndTime = (startStr: string, durStr: string, trailerStr: string): string => {
  if (!startStr) return '';
  
  const timeParts = startStr.split(':');
  const startH = parseInt(timeParts[0] || '0', 10);
  const startM = parseInt(timeParts[1] || '0', 10);
  
  const durMatch = durStr?.match(/\d+/);
  const movieMins = durMatch ? parseInt(durMatch[0], 10) : 0;
  
  const trailerMatch = trailerStr?.match(/\d+/);
  const trailerMins = trailerMatch ? parseInt(trailerMatch[0], 10) : 0;
  
  const totalMinutes = (startH * 60) + startM + movieMins + trailerMins;
  
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};

const capitalizeFirst = (value: string): string => (
  value ? `${value.charAt(0).toLocaleUpperCase()}${value.slice(1)}` : value
);

const formatSmartDate = (dateStr: string, locale: AppLocale): string => {
  if (!dateStr) return '';
  if (/^(Hoje|Amanhã),\s/i.test(dateStr)) {
    const isTomorrow = /^Amanhã/i.test(dateStr);
    return dateStr
      .replace(/^(Hoje|Amanhã)/i, translate(isTomorrow ? 'calendar.tomorrow' : 'calendar.today', undefined, locale))
      .replace(/\bMar\b/i, translate('calendar.mar', undefined, locale))
      .replace(/\bJul\b/i, translate('calendar.jul', undefined, locale));
  }
  
  let safeDateStr = dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    safeDateStr = `${dateStr}T12:00:00`;
  }
  
  const d = new Date(safeDateStr);
  if (isNaN(d.getTime())) return dateStr; 
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = capitalizeFirst(new Intl.DateTimeFormat(locale, { month: 'short' }).format(d).replace('.', ''));
  const weekday = capitalizeFirst(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).replace('.', ''));
  const year = d.getFullYear();
  
  const isCurrentYear = year === now.getFullYear();
  const isNextYear = year === now.getFullYear() + 1;
  const isDecember18OrLater = now.getMonth() === 11 && now.getDate() >= 18;
  const isWithinThreshold = isDecember18OrLater && isNextYear;
  
  if (diffDays === 0) {
    return `${translate('calendar.today', undefined, locale)}, ${day} ${month}`;
  } else if (diffDays === 1) {
    return `${translate('calendar.tomorrow', undefined, locale)}, ${day} ${month}`;
  } else {
    if (!isCurrentYear && !isWithinThreshold) {
      return `${day} ${month} ${year}`;
    }
    return `${weekday}, ${day} ${month}`;
  }
};

export const PreCheckoutSummary: React.FC<PreCheckoutSummaryProps> = ({
  className = '',
  movieName = 'A Odisséia',
  originCountry,
  genre = 'Aventura',
  duration = '180',
  date = '2026-07-20',
  startTime = '10:00',
  trailerDuration = '20',
  showEndTime = false,
  auditorium = '5',
  language = 'Dub',
  experiences = ['2D', 'VIP', 'Laser'],
  selectedSeats = ['B4', 'B5', 'B6'],
  showSelectedSeats = true,
  selectedTickets = ['1x Combo 2 Ingressos', '1x Inteira'],
  numberOfTickets = '3',
  showSelectedTickets = false,
  formatDurationToMinutes = true,
  
  posterImageUrl = placeholderImg,
  posterTagLabel = 'Estreia',
  posterRatingValue = '18',
  showPosterTag = true,
  showPosterRating = true,
}) => {
  const { locale, t } = useI18n();

  const calculatedEndTime = calculateEndTime(startTime, duration, trailerDuration);
  const hasTickets = selectedTickets && selectedTickets.length > 0;
  const finalTicketCount = hasTickets ? numberOfTickets : '0';
  const parsedTrailerDur = trailerDuration?.match(/\d+/)?.[0] || '0';

  return (
    <div className={`pre-checkout-summary ${className}`.trim()}>
      <MoviePoster 
        className="pre-checkout-summary__movie-poster"
        imageUrl={posterImageUrl} 
        movieTitle={movieName} 
        showTag={showPosterTag}
        tagLabel={posterTagLabel}
        showRating={showPosterRating}
        ratingValue={posterRatingValue}
      />

      <div className="pre-checkout-summary__content">
        <h5 className="pre-checkout-summary__title">{movieName}</h5>
        
        <div className="pre-checkout-summary__genre-duration">
          <span title={localizeMovieGenre(getPrimaryGenre(genre), t)}>{localizeMovieGenre(getPrimaryGenre(genre), t)}</span>
          <span>|</span>
          <span>{formatMovieDuration(duration, formatDurationToMinutes, locale)}</span>
        </div>
        
        <div className="pre-checkout-summary__date-time">
          <span>{formatSmartDate(date, locale)}</span>
          <span>•</span>
          <span>{formatLocalizedShowtime(startTime, locale)}</span>
        </div>
        
        {showEndTime && (
          <div className="pre-checkout-summary__end-time-block">
            <div className="pre-checkout-summary__end-time">
              <span>{t('checkout.estimatedEnd')}</span>
              <span>~{formatLocalizedShowtime(calculatedEndTime, locale)}</span>
            </div>
            <p className="pre-checkout-summary__end-time-caption">
              {t('checkout.trailerEstimate', { minutes: parsedTrailerDur })}
            </p>
          </div>
        )}

        {auditorium && (
          <div className="pre-checkout-summary__row">
            <p className="pre-checkout-summary__label">{t('movie.auditorium')}</p>
            <p className="pre-checkout-summary__label">{auditorium}</p>
          </div>
        )}

        {language && (
          <div className="pre-checkout-summary__row">
            <p className="pre-checkout-summary__label">{t('checkout.language')}</p>
            <Tag text={t(resolveMovieLanguage(language, originCountry, locale))} status="Brand" />
          </div>
        )}

        {experiences && experiences.length > 0 && (
          <div className="pre-checkout-summary__row">
            <p className="pre-checkout-summary__label">{t('checkout.experience')}</p>
            <div className="pre-checkout-summary__tags">
              {experiences.map((exp, idx) => (
                <Tag key={`exp-${idx}`} text={exp} status="Information" />
              ))}
            </div>
          </div>
        )}

        {showSelectedSeats && (
          <div className="pre-checkout-summary__row">
            <p className="pre-checkout-summary__label">{t('checkout.seats')}</p>
            <div className="pre-checkout-summary__tags">
              {selectedSeats?.map((seat, idx) => (
                <Tag key={`seat-${idx}`} text={localizeSeatTag(seat, t)} status="Neutral" />
              ))}
            </div>
          </div>
        )}

        {showSelectedTickets && (
          <>
            <div className="pre-checkout-summary__row">
              <p className="pre-checkout-summary__label">{t('checkout.selectedTickets')}</p>
              <div className="pre-checkout-summary__tags">
                {hasTickets && selectedTickets.map((ticket, idx) => (
                  <Tag key={`ticket-${idx}`} text={ticket} status="Neutral" />
                ))}
              </div>
            </div>

            <div className="pre-checkout-summary__row">
              <p className="pre-checkout-summary__label">{t('checkout.totalTickets')}</p>
              <div className="pre-checkout-summary__total-tickets">
                <span className="pre-checkout-summary__total-number">{finalTicketCount}</span>
                <span className="pre-checkout-summary__total-number">{t('checkout.ticketCountUnit')}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
