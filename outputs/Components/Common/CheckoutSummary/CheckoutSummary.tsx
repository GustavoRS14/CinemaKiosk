import React from 'react';
import { MoviePoster } from '../MoviePoster';
import { RatingAge, RatingAgeVariant } from '../RatingAge';
import { Tag } from '../Tag';
import { Divider } from '../Divider';
import { OrderItem, OrderItemProps } from '../OrderItem';
import { useI18n } from '../../../i18n';
import './CheckoutSummary.css';
import { formatMovieDuration } from '../formatMovieDuration';
import { formatLocalizedCheckoutDate, formatLocalizedShowtime, localizeMovieGenre, localizeSeatTag, resolveMovieLanguage } from '../movieLocalization';

export interface SelectedTicket {
  label: string;
  price: string;
}

export interface TicketsProps {
  movieTitle: string;
  originCountry?: string;
  ratingValue: RatingAgeVariant;
  movieTags: string[];
  duration?: string;
  trailerDuration?: string;
  formatDurationToMinutes?: boolean;
  movieImageUrl: string;
  dateStr: string;
  startTime: string;
  showEndTime?: boolean;
  endTime?: string;
  auditorium: string;
  language: string;
  experienceTags: string[];
  seatTags: string[];
  selectedTickets: SelectedTicket[];
  totalTicketsCount: number;
  totalPrice: string;
}

export interface ConcessionsProps {
  items: OrderItemProps[];
  pickupMethod?: string;
  totalPrice: string;
  // CRITICAL FIX: Added new props for delivery option
  showDeliveryOption?: boolean;
  deliveryEstimate?: string;
}

export interface CheckoutSummaryProps {
  /**
   * The variant of the checkout summary.
   */
  variant: 'Tickets' | 'Concessions';
  /**
   * Props specific to the Tickets variant.
   */
  ticketsProps?: TicketsProps;
  /**
   * Props specific to the Concessions variant.
   */
  concessionsProps?: ConcessionsProps;
}

// CRITICAL FIX: Helpers for parsing and formatting BRL currency strings
const parsePriceToNumber = (priceStr?: string): number => {
  if (!priceStr) return 0;
  const cleanStr = priceStr.toString().replace(/\./g, '').replace(',', '.');
  const val = parseFloat(cleanStr);
  return isNaN(val) ? 0 : val;
};

const formatPriceToString = (val: number): string => {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const calculateEndTime = (startTime: string, duration?: string, trailerDuration = '20'): string | undefined => {
  const timeMatch = startTime.match(/^(\d{1,2}):(\d{2})$/);
  const durationMatch = duration?.match(/\d+/);
  const trailerMatch = trailerDuration.match(/\d+/);
  if (!timeMatch || !durationMatch) return undefined;

  const totalMinutes = (Number(timeMatch[1]) * 60)
    + Number(timeMatch[2])
    + Number(durationMatch[0])
    + Number(trailerMatch?.[0] ?? 0);
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `~${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  variant,
  ticketsProps,
  concessionsProps,
}) => {
  const { locale, t } = useI18n();
  if (variant === 'Tickets' && ticketsProps) {
    const tp = ticketsProps;

    // CRITICAL FIX: Default showEndTime explicitly to false if undefined
    const showEndTime = tp.showEndTime ?? false;
    const resolvedEndTime = tp.endTime ?? calculateEndTime(tp.startTime, tp.duration, tp.trailerDuration);

    // CRITICAL FIX: Calculate the total price based on individual ticket prices
    const rawTicketsTotalValue = tp.selectedTickets.reduce((acc, ticket) => {
      return acc + parsePriceToNumber(ticket.price);
    }, 0);
    const calculatedTicketsTotalPrice = formatPriceToString(rawTicketsTotalValue);

    return (
      <div className="checkout-summary checkout-summary--tickets">
        <header className="checkout-summary__header">
          <h2 className="checkout-summary__title">{t('checkout.tickets')}</h2>
        </header>

        <div className="checkout-summary__poster-info">
          <div className="checkout-summary__poster-wrapper">
            <MoviePoster imageUrl={tp.movieImageUrl} movieTitle={tp.movieTitle} />
          </div>
          <div className="checkout-summary__info-content">
            <div className="checkout-summary__movie-title-row">
              <h3 className="checkout-summary__movie-title">{tp.movieTitle}</h3>
              <RatingAge rating={tp.ratingValue} borderType="Theme Adaptive" />
              <Tag text={t('movie.premiere')} />
            </div>
            <div className="checkout-summary__movie-tags">
              {[...tp.movieTags.map((tag) => localizeMovieGenre(tag, t)), ...(tp.duration ? [formatMovieDuration(tp.duration, tp.formatDurationToMinutes ?? true, locale)] : [])].map((tag, index, tags) => (
                <React.Fragment key={index}>
                  <span>{tag}</span>
                  {index < tags.length - 1 && <span>|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="checkout-summary__divider-wrapper">
          <div className="checkout-summary__divider-elipse checkout-summary__divider-elipse--left"></div>
          <div className="checkout-summary__divider-line">
            <Divider type="Dashed" />
          </div>
          <div className="checkout-summary__divider-elipse checkout-summary__divider-elipse--right"></div>
        </div>

        <div className="checkout-summary__details">
          <div className="checkout-summary__row--start checkout-summary__datetime">
            <span className="checkout-summary__row-value">{formatLocalizedCheckoutDate(tp.dateStr, locale)}</span>
            <span className="checkout-summary__row-value">•</span>
            <span className="checkout-summary__row-value">{formatLocalizedShowtime(tp.startTime, locale)}</span>
          </div>
          
          {/* Using the defaulted variable */}
          {showEndTime && resolvedEndTime && (
            <div className="checkout-summary__row--compact">
              <span className="checkout-summary__row-label">{t('checkout.estimatedEnd')}</span>
              <span className="checkout-summary__value--medium">~{formatLocalizedShowtime(resolvedEndTime.replace(/^~/, ''), locale)}</span>
            </div>
          )}

          <div className="checkout-summary__row--compact">
            <span className="checkout-summary__row-label">{t('movie.auditorium')}</span>
            <span className="checkout-summary__value--medium">{tp.auditorium}</span>
          </div>

          <div className="checkout-summary__row--tags">
            <span className="checkout-summary__row-label">{t('checkout.language')}</span>
            <Tag
              status="Brand"
              text={t(resolveMovieLanguage(tp.language, tp.originCountry, locale))}
            />
          </div>

          <div className="checkout-summary__row--tags">
            <span className="checkout-summary__row-label">{t('checkout.experience')}</span>
            <div className="checkout-summary__tags-group">
              {tp.experienceTags.map(tag => <Tag key={tag} status="Information" text={tag} />)}
            </div>
          </div>

          <div className="checkout-summary__row--tags">
            <span className="checkout-summary__row-label">{t('checkout.seats')}</span>
            <div className="checkout-summary__tags-group">
              {tp.seatTags.map(tag => <Tag key={tag} text={localizeSeatTag(tag, t)} />)}
            </div>
          </div>

          <div className="checkout-summary__row checkout-summary__row--col">
            <span className="checkout-summary__row-label">{t('checkout.selectedTickets')}</span>
            <div className="checkout-summary__ticket-list">
              {tp.selectedTickets.map((ticket, index) => (
                <div key={index} className="checkout-summary__ticket-item">
                  <Tag text={ticket.label} />
                  <span className="checkout-summary__ticket-price">R$ {ticket.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="checkout-summary__row">
            <span className="checkout-summary__row-label">{t('checkout.totalTickets')}</span>
            <span className="checkout-summary__row-value checkout-summary__row-value--info" style={{ gap: 0 }}>
              <span className="checkout-summary__row-value--bold">{tp.totalTicketsCount}</span>
              <span>{t('checkout.ticketCountUnit')}</span>
            </span>
          </div>

          <div className="checkout-summary__row">
            <span className="checkout-summary__row-label">{t('checkout.totalValue')}</span>
            {/* CRITICAL FIX: Render dynamic calculated price instead of static prop */}
            <span className="checkout-summary__row-value checkout-summary__row-value--total">R$ {calculatedTicketsTotalPrice}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'Concessions' && concessionsProps) {
    const cp = concessionsProps;

    // Defaulting the new prop
    const showDelivery = cp.showDeliveryOption ?? false;

    // CRITICAL FIX: Dynamically calculate total products count based on quantities
    const totalItemsCount = cp.items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

    // CRITICAL FIX: Calculate the total price based on individual item prices and quantities
    const rawTotalValue = cp.items.reduce((acc, item) => {
      const itemPrice = parsePriceToNumber(item.price);
      const itemQty = Number(item.quantity) || 1;
      return acc + (itemPrice * itemQty);
    }, 0);
    const calculatedTotalPrice = formatPriceToString(rawTotalValue);

    return (
      <div className="checkout-summary">
        <header className="checkout-summary__header">
          <h2 className="checkout-summary__title">{t('checkout.concessions')}</h2>
        </header>

        <div className="checkout-summary__product-list">
          {cp.items.map((item, index) => (
            <React.Fragment key={index}>
              {/* CRITICAL FIX: The divider is now injected BEFORE the item (if not the first item) */}
              {index > 0 && (
                <div className="checkout-summary__product-divider">
                  <Divider />
                </div>
              )}
              <div className="checkout-summary__product-wrapper">
                <OrderItem {...item} context="Summary" />
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="checkout-summary__metadata">
          {/* CRITICAL FIX: New Delivery Option Block */}
          {showDelivery && (
            <div className="checkout-summary__delivery-block">
              <span className="checkout-summary__row-label">{t('checkout.deliveryMethod')}</span>
              <div className="checkout-summary__delivery-info">
                <span className="checkout-summary__delivery-text">{t('checkout.seatDelivery')}</span>
                <Tag status="Information" text={t('checkout.estimate', { value: cp.deliveryEstimate || '' }).trim()} />
              </div>
            </div>
          )}

          {/* CRITICAL FIX: Wrapped totals to maintain 16px gap internally, while parent handles 24px */}
          <div className="checkout-summary__totals-wrapper">
            <div className="checkout-summary__row">
              <span className="checkout-summary__row-label">{t('checkout.totalProducts')}</span>
              <span className="checkout-summary__row-value checkout-summary__row-value--info" style={{ gap: 0 }}>
                <span className="checkout-summary__row-value--bold">{totalItemsCount}</span>
                <span>{t('checkout.productCountUnit')}</span>
              </span>
            </div>

            <div className="checkout-summary__row">
              <span className="checkout-summary__row-label">{t('checkout.totalValue')}</span>
              <span className="checkout-summary__row-value checkout-summary__row-value--total">R$ {calculatedTotalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
