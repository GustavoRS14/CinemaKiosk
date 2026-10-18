import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AOdisseiaPoster from '@images/a-odisseia-2.png';
import { PreCheckoutSummary } from '@components/Common/PreCheckoutSummary';
import { PageLoadingScreen, usePageLoadingScreen } from '@components/Common/PageLoadingScreen';
import { TicketGroup, type TicketGroupOption } from '@components/Common/TicketGroup';
import { FilterChip } from '@components/Common/FilterChip';
import { Footer } from '@components/Layout/Footer/Footer';
import { PurchaseHeader } from '../../PurchaseHeader';
import {
  PurchaseSessionClosingAlert,
  useSalesClosingCountdown,
} from '../../PurchaseSessionClosingAlert';
import {
  useFeaturePreferences,
  type TicketCategoryFilterPreference,
} from '../../../../featurePreferences';
import { useOrientation } from '../../../../useOrientation';
import { useI18n } from '../../../../../i18n';
import type { MoviePurchaseNavigationState } from '../../../Movies/movieNavigation';
import { resetMoviePurchaseTotal, setMovieTicketTotal } from '../moviePurchaseTotal';
import './MovieTicketSelectionPage.css';

export type SeatKind = 'Comum' | 'Cadeirante' | 'Acompanhante' | 'VIP' | 'Super';
export type SeatCategory = 'Padrão' | 'VIP' | 'Super';

export type SelectedMovieSeat = {
  label: string;
  kind: SeatKind;
};

export type MovieTicketSelectionPageProps = {
  selectedSeats?: readonly SelectedMovieSeat[];
  ticketOptions?: Partial<Record<SeatCategory, TicketGroupOption[]>>;
  sessionStartTime?: string;
  showtimeDate?: Date | string;
  salesCutoffMinutes?: number;
  availableSeats?: number;
  movieDetailsPath?: string;
  onViewNextShowtimes?: () => void;
  onAdvance?: () => void;
};

const defaultSelectedSeats: readonly SelectedMovieSeat[] = [
  { label: 'B4', kind: 'Comum' },
  { label: 'B5', kind: 'Comum' },
  { label: 'B6', kind: 'Comum' },
];

const defaultTicketOptionsByCategory: Record<SeatCategory, TicketGroupOption[]> = {
  Padrão: [
    { id: 'full', type: 'Inteira', price: '40,00', supportingText: '' },
    { id: 'combo', type: 'Combo 2 Ingressos', price: '30,00', supportingText: 'Ingresso Promocional', ticketsPerPackage: 2 },
    { id: 'half', type: 'Meia', price: '20,00', supportingText: '' },
  ],
  VIP: [
    { id: 'full', type: 'Inteira', price: '45,00', supportingText: '' },
    { id: 'combo', type: 'Combo 2 Ingressos', price: '35,00', supportingText: 'Ingresso Promocional', ticketsPerPackage: 2 },
    { id: 'half', type: 'Meia', price: '22,50', supportingText: '' },
  ],
  Super: [
    { id: 'full', type: 'Inteira', price: '50,00', supportingText: '' },
    { id: 'combo', type: 'Combo 2 Ingressos', price: '40,00', supportingText: 'Ingresso Promocional', ticketsPerPackage: 2 },
    { id: 'half', type: 'Meia', price: '25,00', supportingText: '' },
  ],
};

const categoryOrder: SeatCategory[] = ['Padrão', 'VIP', 'Super'];

const getSeatCategory = (kind: SeatKind): SeatCategory => (
  kind === 'VIP' || kind === 'Super' ? kind : 'Padrão'
);

const quantityKey = (category: SeatCategory, ticketId: string | number) => `${category}:${ticketId}`;
const parsePrice = (price: string) => Number(price.replace('.', '').replace(',', '.'));
const formatPrice = (price: number) => price.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getTicketCategoryFilter = (ticket: TicketGroupOption): Exclude<TicketCategoryFilterPreference, 'all'> | 'other' => {
  const normalizedType = (ticket.type ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normalizedSupportingText = (ticket.supportingText ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalizedSupportingText.includes('promoc') || normalizedType.includes('combo')) return 'promotional';
  if (normalizedType.includes('inteira') || normalizedType.includes('full') || normalizedType.includes('entera')) return 'full';
  if (normalizedType.includes('meia') || normalizedType.includes('half') || normalizedType.includes('media')) return 'half';
  return 'other';
};

export function MovieTicketSelectionPage({
  selectedSeats = defaultSelectedSeats,
  ticketOptions,
  sessionStartTime,
  showtimeDate,
  salesCutoffMinutes,
  availableSeats,
  movieDetailsPath,
  onViewNextShowtimes,
  onAdvance,
}: MovieTicketSelectionPageProps) {
  const isPageLoading = usePageLoadingScreen();
  const pageRef = useRef<HTMLDivElement>(null);
  const orientation = useOrientation();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const purchaseNavigation = location.state as MoviePurchaseNavigationState | null;
  const {
    formatDurationToMinutes,
    showEstimatedEndTime,
    ticketCategoryFilter,
    ticketCategoryFilterDefault,
  } = useFeaturePreferences();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeTicketFilter, setActiveTicketFilter] = useState<TicketCategoryFilterPreference>(ticketCategoryFilterDefault);
  const [advanceAttempted, setAdvanceAttempted] = useState(false);
  const [validationTargetKey, setValidationTargetKey] = useState<string>();
  const remainingSalesMinutes = useSalesClosingCountdown(sessionStartTime ? {
    time: sessionStartTime,
    showtimeDate,
    salesCutoffMinutes,
  } : undefined);

  const availableTicketOptions = useMemo<Record<SeatCategory, TicketGroupOption[]>>(() => ({
    ...defaultTicketOptionsByCategory,
    ...ticketOptions,
  }), [ticketOptions]);

  const orderedTicketFilters = useMemo(() => {
    const filters: TicketCategoryFilterPreference[] = ['all', 'promotional', 'full', 'half'];
    if (ticketCategoryFilterDefault === 'all') return filters;
    return [
      ticketCategoryFilterDefault,
      ...filters.filter((filter) => filter !== ticketCategoryFilterDefault && filter !== 'all'),
      'all' as const,
    ];
  }, [ticketCategoryFilterDefault]);

  useEffect(() => {
    setActiveTicketFilter(ticketCategoryFilterDefault);
  }, [ticketCategoryFilterDefault]);

  const seatGroups = useMemo(() => categoryOrder.flatMap((category) => {
    const seats = selectedSeats.filter((seat) => getSeatCategory(seat.kind) === category);
    return seats.length > 0 ? [{ category, seats }] : [];
  }), [selectedSeats]);

  const requiredTickets = selectedSeats.length;
  const totalTickets = Object.values(quantities).reduce((total, quantity) => total + quantity, 0);
  const multipleSeatTypes = seatGroups.length > 1;

  const getGroupTotal = (category: SeatCategory, values = quantities) => (
    availableTicketOptions[category].reduce((total, ticket) => (
      total + (values[quantityKey(category, ticket.id)] ?? 0)
    ), 0)
  );

  const firstIncompleteCategory = seatGroups.find(({ category, seats }) => (
    getGroupTotal(category) !== seats.length
  ))?.category;
  const hasCorrectTicketCount = totalTickets === requiredTickets && firstIncompleteCategory === undefined;
  const missingTickets = seatGroups.reduce((missing, { category, seats }) => (
    missing + Math.max(0, seats.length - getGroupTotal(category))
  ), 0);
  const validationMessage = t(
    missingTickets === 1 ? 'tickets.validationSingular' : 'tickets.validation',
    { count: missingTickets },
  );

  const selectedTickets = useMemo(
    () => seatGroups.flatMap(({ category }) => availableTicketOptions[category].flatMap((ticket) => {
      const quantity = quantities[quantityKey(category, ticket.id)] ?? 0;
      if (quantity <= 0) return [];
      const categoryLabel = multipleSeatTypes ? ` (${category})` : '';
      return [`${quantity}x ${ticket.type}${categoryLabel}`];
    })),
    [availableTicketOptions, multipleSeatTypes, quantities, seatGroups],
  );

  const totalPrice = useMemo(
    () => seatGroups.reduce((total, { category }) => (
      total + availableTicketOptions[category].reduce((groupTotal, ticket) => (
        groupTotal
        + ((quantities[quantityKey(category, ticket.id)] ?? 0)
          / Math.max(1, Math.floor(ticket.ticketsPerPackage ?? 1)))
          * parsePrice(ticket.price ?? '0,00')
      ), 0)
    ), 0),
    [availableTicketOptions, quantities, seatGroups],
  );

  useEffect(() => {
    setMovieTicketTotal(totalPrice, totalTickets);
  }, [totalPrice, totalTickets]);

  useEffect(() => {
    if (!advanceAttempted || hasCorrectTicketCount) {
      setValidationTargetKey(undefined);
      return undefined;
    }

    let animationFrame = 0;
    const updateValidationTarget = () => {
      const page = pageRef.current;
      if (!page) return;

      const headerBottom = page.querySelector<HTMLElement>('.header')?.getBoundingClientRect().bottom ?? 0;
      const footerTop = page.querySelector<HTMLElement>('.footer')?.getBoundingClientRect().top ?? window.innerHeight;
      const anchors = Array.from(page.querySelectorAll<HTMLElement>('[data-validation-anchor]'));
      const hasVerticalScroll = page.scrollHeight > page.clientHeight + 1;
      if (!hasVerticalScroll) {
        setValidationTargetKey(anchors[0]?.dataset.validationAnchor);
        return;
      }
      const fullyVisible = anchors.filter((anchor) => {
        const rect = anchor.getBoundingClientRect();
        return rect.top >= headerBottom
          && rect.bottom <= footerTop
          && rect.left >= 0
          && rect.right <= window.innerWidth;
      });
      const tooltipSafe = fullyVisible.filter((anchor) => {
        const counterTop = anchor.querySelector<HTMLElement>('.totem-counter')?.getBoundingClientRect().top;
        return counterTop !== undefined && counterTop - headerBottom >= 112;
      });
      const candidates = tooltipSafe;
      const viewportCenter = (headerBottom + footerTop) / 2;
      const target = candidates.reduce<HTMLElement | undefined>((closest, candidate) => {
        if (!closest) return candidate;
        const candidateCenter = candidate.getBoundingClientRect().top + candidate.getBoundingClientRect().height / 2;
        const closestCenter = closest.getBoundingClientRect().top + closest.getBoundingClientRect().height / 2;
        return Math.abs(candidateCenter - viewportCenter) < Math.abs(closestCenter - viewportCenter)
          ? candidate
          : closest;
      }, undefined);

      setValidationTargetKey(target?.dataset.validationAnchor);
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateValidationTarget);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [advanceAttempted, hasCorrectTicketCount, quantities, selectedSeats]);

  const handleOptionChange = (category: SeatCategory, id: string | number, amount: number) => {
    const key = quantityKey(category, id);
    const groupLimit = seatGroups.find((group) => group.category === category)?.seats.length ?? 0;
    const currentAmount = quantities[key] ?? 0;
    const nextTotal = totalTickets - currentAmount + amount;
    const nextGroupTotal = getGroupTotal(category) - currentAmount + amount;

    if (nextTotal > requiredTickets || nextGroupTotal > groupLimit) return;

    setQuantities((current) => ({ ...current, [key]: amount }));
    if (advanceAttempted && amount > currentAmount) setAdvanceAttempted(false);
  };

  const handleAdvance = () => {
    if (!hasCorrectTicketCount) {
      setAdvanceAttempted(true);
      return;
    }

    setAdvanceAttempted(false);
    setMovieTicketTotal(totalPrice, totalTickets);
    onAdvance?.();
  };

  const handleBack = () => {
    resetMoviePurchaseTotal();
    if (purchaseNavigation?.purchaseOrigin === 'movie-details') {
      navigate(purchaseNavigation.movieDetailsPath, {
        state: {
          movie: purchaseNavigation.movie,
          returnPath: purchaseNavigation.returnPath,
        },
      });
      return;
    }
    navigate(-1);
  };

  return (
    <div
      ref={pageRef}
      data-purchase-page
      className={`movie-ticket-selection-page movie-ticket-selection-page--${orientation}${remainingSalesMinutes !== null ? ' movie-ticket-selection-page--sales-closing' : ''}${isPageLoading ? ' page-loading-active' : ''}`}
    >
      <PurchaseHeader
        orientation={orientation}
        sessionStartTime={sessionStartTime}
        showtimeDate={showtimeDate}
        salesCutoffMinutes={salesCutoffMinutes}
        availableSeats={availableSeats}
        movieDetailsPath={movieDetailsPath}
        onViewNextShowtimes={onViewNextShowtimes}
      />
      <PageLoadingScreen active={isPageLoading} />

      <main className="movie-ticket-selection-page__main">
        <div className="movie-ticket-selection-page__layout">
          <PreCheckoutSummary
            showEndTime={showEstimatedEndTime}
            className="movie-ticket-selection-page__summary"
            movieName="A Odisséia"
            genre="Aventura"
            duration="180"
            formatDurationToMinutes={formatDurationToMinutes}
            date="Hoje, 20 Jul"
            startTime={sessionStartTime ?? '10:00'}
            auditorium="5"
            language="Dublado"
            experiences={['2D', 'VIP', 'Laser']}
            selectedSeats={selectedSeats.map((seat) => seat.label)}
            selectedTickets={selectedTickets}
            numberOfTickets={String(totalTickets)}
            showSelectedSeats
            showSelectedTickets
            posterImageUrl={AOdisseiaPoster}
            posterTagLabel="Estreia"
            posterRatingValue="18"
            showPosterTag
            showPosterRating
          />

          <section className="movie-ticket-selection-page__tickets" aria-labelledby="ticket-selection-title">
            <div className="movie-ticket-selection-page__tickets-main">
              <h1 id="ticket-selection-title">{t('tickets.choose')}</h1>
              <div className="movie-ticket-selection-page__ticket-options">
                {ticketCategoryFilter && (
                  <div className="movie-ticket-selection-page__filters" role="group" aria-label={t('tickets.choose')}>
                    {orderedTicketFilters.map((filter) => (
                      <FilterChip
                        key={filter}
                        text={t(({
                          all: 'tickets.filterAll',
                          promotional: 'tickets.filterPromotional',
                          full: 'tickets.filterFull',
                          half: 'tickets.filterHalf',
                        } as const)[filter])}
                        selected={activeTicketFilter === filter}
                        controlledSelection
                        onClick={() => setActiveTicketFilter(filter)}
                      />
                    ))}
                  </div>
                )}
                <div className="movie-ticket-selection-page__ticket-groups">
                  {seatGroups.map(({ category, seats }) => {
                    const groupTotal = getGroupTotal(category);
                    const limitReached = groupTotal >= seats.length || totalTickets >= requiredTickets;
                    const groupIncomplete = groupTotal !== seats.length;
                    const visibleTickets = availableTicketOptions[category].filter((ticket) => (
                      !ticketCategoryFilter
                      || activeTicketFilter === 'all'
                      || getTicketCategoryFilter(ticket) === activeTicketFilter
                    ));
                    if (visibleTickets.length === 0) return null;
                    const options = visibleTickets.map((ticket) => {
                      const amount = quantities[quantityKey(category, ticket.id)] ?? 0;
                      const optionKey = quantityKey(category, ticket.id);
                      const ticketsPerPackage = Math.max(1, Math.floor(ticket.ticketsPerPackage ?? 1));
                      const remainingTicketsInGroup = Math.max(0, seats.length - groupTotal);
                      const packageDoesNotFit = ticketsPerPackage > remainingTicketsInGroup;
                      return {
                        ...ticket,
                        amount,
                        counterState: limitReached || packageDoesNotFit
                          ? (amount > 0 ? 'Maximum' as const : 'Disabled' as const)
                          : undefined,
                        validationAnchorId: advanceAttempted && groupIncomplete ? optionKey : undefined,
                        showValidationTooltip: advanceAttempted && validationTargetKey === optionKey,
                        validationMessage,
                      };
                    });

                    return (
                      <TicketGroup
                        key={category}
                        showTitle={multipleSeatTypes}
                        title={t('tickets.seat')}
                        seatType={category}
                        options={options}
                        onOptionChange={(id, amount) => handleOptionChange(category, id, amount)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        {remainingSalesMinutes !== null && (
          <PurchaseSessionClosingAlert remainingMinutes={remainingSalesMinutes} />
        )}
      </main>

      <Footer
        showCenterAction={false}
        price={formatPrice(totalPrice)}
        onBack={handleBack}
        onMainAction={handleAdvance}
      />
    </div>
  );
}
