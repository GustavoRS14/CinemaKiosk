import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PinchIcon from '@icons/pinch.svg';
import MouseIcon from '@icons/Mouse.svg';
import NoSeatIllustration from '@illustrations/NoSeat.svg';
import CompanionSeatIllustration from '@illustrations/CompanionSeat.svg';
import WheelchairSeatIllustration from '@illustrations/WheelchairSeat.svg';
import AOdisseiaPoster from '@images/a-odisseia-2.png';
import { Alert } from '@components/Common/Alert';
import { Legend } from '@components/Common/Legend';
import { MapOfSeats, type SeatItemData, type SeatRowData } from '@components/Common/MapOfSeats';
import { PreCheckoutSummary } from '@components/Common/PreCheckoutSummary';
import { PageLoadingScreen, usePageLoadingScreen } from '@components/Common/PageLoadingScreen';
import { Seat } from '@components/Common/Seat';
import { ZoomControl } from '@components/Common/ZoomControl';
import { Footer } from '@components/Layout/Footer/Footer';
import { ActionDialog } from '@components/Overlays/Dialog/ActionDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import { PurchaseHeader } from '../../PurchaseHeader';
import {
  PurchaseSessionClosingAlert,
  useSalesClosingCountdown,
} from '../../PurchaseSessionClosingAlert';
import { useFeaturePreferences } from '../../../../featurePreferences';
import { useCustomerPurchaseLimits } from '../../../customerPurchaseLimits';
import { useOrientation } from '../../../../useOrientation';
import { useI18n, type TranslationKey } from '../../../../../i18n';
import './MovieSeatSelectionPage.css';

type SeatCode = 'A' | 'O' | 'W' | 'WO' | 'C' | 'CO' | 'B' | 'BO' | null;

const DEFAULT_ZOOM_CONTROL_SLIDER_HEIGHT = 258;
const COMPACT_ZOOM_CONTROL_BREAKPOINT = 1366;
const SIX_COLUMN_LEGEND_DEVICE_WIDTH = 1920;

const hasWidePhysicalScreen = () => {
  if (typeof window === 'undefined') return false;
  return Math.round(window.screen.width * window.devicePixelRatio) >= SIX_COLUMN_LEGEND_DEVICE_WIDTH;
};

const seatTypeLabels: Partial<Record<SeatItemData['type'], string>> = {
  Obese: 'Obeso',
  Wheelchair: 'Cadeirante',
  Companion: 'Acompanhante',
  VIP: 'VIP',
  Super: 'Super',
};

const formatSelectedSeat = (seat: SeatItemData) => {
  const typeLabel = seatTypeLabels[seat.type];
  return typeLabel ? `${seat.seatNumber} (${typeLabel})` : seat.seatNumber;
};

function SeatLimitAlert({ limit, onClose }: { limit: number; onClose: () => void }) {
  const { t } = useI18n();
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const purchasePage = shell?.closest<HTMLElement>('[data-purchase-page]');
    if (!shell || !purchasePage) return undefined;

    const updateAlertHeight = () => {
      purchasePage.style.setProperty('--seat-limit-alert-height', `${shell.offsetHeight}px`);
    };
    updateAlertHeight();
    const observer = new ResizeObserver(updateAlertHeight);
    observer.observe(shell);
    return () => {
      observer.disconnect();
      purchasePage.style.removeProperty('--seat-limit-alert-height');
    };
  }, []);

  return (
    <div ref={shellRef} className="movie-seat-selection-page__limit-alert-shell">
      <Alert
        className="movie-seat-selection-page__limit-alert"
        intent="Warning"
        onClose={onClose}
        title={t('seats.maxTitle')}
        description={t('seats.maxDescription', { limit })}
      />
    </div>
  );
}

const seatDefinition: Record<Exclude<SeatCode, null>, Pick<SeatItemData, 'type' | 'state'>> = {
  A: { type: 'Standard', state: 'Available' },
  O: { type: 'Standard', state: 'Occupied' },
  W: { type: 'Wheelchair', state: 'Available' },
  WO: { type: 'Wheelchair', state: 'Occupied' },
  C: { type: 'Companion', state: 'Available' },
  CO: { type: 'Companion', state: 'Occupied' },
  B: { type: 'Obese', state: 'Available' },
  BO: { type: 'Obese', state: 'Occupied' },
};

function createRow(rowLabel: string, codes: SeatCode[]): SeatRowData {
  let seatNumber = 0;

  return {
    rowLabel,
    seats: codes.map((code) => {
      if (code === null) return null;
      seatNumber += 1;
      const id = `${rowLabel}${seatNumber}`;
      return { id, seatNumber: id, ...seatDefinition[code] };
    }),
  };
}

const initialRows: SeatRowData[] = [
  createRow('G', ['O', 'O', 'O', 'O', 'A', 'C', 'W', null, 'W', 'C', 'A', 'A', 'O', 'O', 'O']),
  createRow('F', ['A', 'A', 'A', 'A', 'O', 'O', 'O', null, 'A', 'A', 'O', 'O', 'A', 'A', 'A']),
  createRow('E', ['A', 'A', 'O', 'O', 'A', 'O', 'O', null, 'O', 'O', 'A', 'A', 'O', 'O', 'A']),
  createRow('D', ['A', 'A', 'A', 'O', 'O', 'O', 'O', null, 'A', 'A', 'O', 'O', 'A', 'A', 'A']),
  createRow('C', ['A', 'A', 'A', 'A', 'A', 'A', 'A', null, 'O', 'A', 'A', 'A', 'A', 'A', 'A']),
  createRow('B', ['A', 'A', 'A', 'A', 'A', 'A', 'A', null, 'A', 'A', 'A', 'A', 'A', 'A', 'A']),
  createRow('A', ['B', 'A', 'A', 'A', 'A', 'CO', 'WO', null, 'W', 'CO', 'A', 'A', 'A', 'A', 'BO']),
];

const seatLegend = [
  { labelKey: 'seats.available', type: 'Standard', state: 'Available' },
  { labelKey: 'seats.selected', type: 'Standard', state: 'Selected' },
  { labelKey: 'seats.occupied', type: 'Standard', state: 'Occupied' },
  { labelKey: 'seats.obese', type: 'Obese', state: 'Available' },
  { labelKey: 'seats.wheelchair', type: 'Wheelchair', state: 'Available' },
  { labelKey: 'seats.companion', type: 'Companion', state: 'Available' },
] satisfies Array<{ labelKey: TranslationKey; type: SeatItemData['type']; state: SeatItemData['state'] }>;

export type MovieSeatSelectionPageProps = {
  sessionStartTime?: string;
  showtimeDate?: Date | string;
  salesCutoffMinutes?: number;
  availableSeats?: number;
  movieDetailsPath?: string;
  onViewNextShowtimes?: () => void;
  /**
   * Set by the native hardware layer for any external mouse, regardless of
   * connection type (USB, Bluetooth, or wireless receiver). Keep false for
   * touchscreen-only devices and touchpads.
   */
  hasExternalMouse?: boolean;
  onAdvance?: () => void;
};

export function MovieSeatSelectionPage({
  sessionStartTime,
  showtimeDate,
  salesCutoffMinutes,
  availableSeats,
  movieDetailsPath,
  onViewNextShowtimes,
  hasExternalMouse = false,
  onAdvance,
}: MovieSeatSelectionPageProps) {
  const isPageLoading = usePageLoadingScreen();
  const orientation = useOrientation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { formatDurationToMinutes, showEstimatedEndTime } = useFeaturePreferences();
  const { maxSeatSelections } = useCustomerPurchaseLimits();
  const [rows, setRows] = useState<SeatRowData[]>(initialRows);
  const [seatLimitAlertVisible, setSeatLimitAlertVisible] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [isWideDevice, setIsWideDevice] = useState(hasWidePhysicalScreen);
  const [isNoSeatDialogOpen, setIsNoSeatDialogOpen] = useState(false);
  const [pendingAccessibleSeat, setPendingAccessibleSeat] = useState<{
    seatId: string;
    state: SeatItemData['state'];
    type: Extract<SeatItemData['type'], 'Companion' | 'Wheelchair'>;
  } | null>(null);
  const seatLimitAlertTimeoutRef = useRef<number | null>(null);
  const mapLayoutRef = useRef<HTMLDivElement>(null);
  const zoomControlRef = useRef<HTMLDivElement>(null);
  const remainingSalesMinutes = useSalesClosingCountdown(sessionStartTime ? {
    time: sessionStartTime,
    showtimeDate,
    salesCutoffMinutes,
  } : undefined);

  const selectedSeatItems = useMemo(
    () => rows.flatMap((row) => row.seats.flatMap((seat) => seat?.state === 'Selected' ? [seat] : [])),
    [rows],
  );
  const selectedSeats = useMemo(
    () => selectedSeatItems.map(formatSelectedSeat),
    [selectedSeatItems],
  );
  const showSeatLimitAlert = () => {
    if (seatLimitAlertTimeoutRef.current !== null) {
      window.clearTimeout(seatLimitAlertTimeoutRef.current);
    }
    setSeatLimitAlertVisible(true);
    seatLimitAlertTimeoutRef.current = window.setTimeout(() => {
      setSeatLimitAlertVisible(false);
      seatLimitAlertTimeoutRef.current = null;
    }, 5_000);
  };

  const hideSeatLimitAlert = () => {
    if (seatLimitAlertTimeoutRef.current !== null) {
      window.clearTimeout(seatLimitAlertTimeoutRef.current);
      seatLimitAlertTimeoutRef.current = null;
    }
    setSeatLimitAlertVisible(false);
  };

  useEffect(() => () => {
    if (seatLimitAlertTimeoutRef.current !== null) {
      window.clearTimeout(seatLimitAlertTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (selectedSeatItems.length < maxSeatSelections && seatLimitAlertVisible) {
      hideSeatLimitAlert();
    }
  }, [maxSeatSelections, seatLimitAlertVisible, selectedSeatItems.length]);

  useEffect(() => {
    if (selectedSeatItems.length <= maxSeatSelections) return;
    const retainedSeatIds = new Set(
      selectedSeatItems.slice(0, maxSeatSelections).map(({ id }) => id),
    );
    setRows((currentRows) => currentRows.map((row) => ({
      ...row,
      seats: row.seats.map((seat) => seat?.state === 'Selected' && !retainedSeatIds.has(seat.id)
        ? { ...seat, state: 'Available' }
        : seat),
    })));
  }, [maxSeatSelections, selectedSeatItems]);

  useEffect(() => {
    const updateWideDevice = () => setIsWideDevice(hasWidePhysicalScreen());
    updateWideDevice();
    window.addEventListener('resize', updateWideDevice);
    return () => window.removeEventListener('resize', updateWideDevice);
  }, []);

  useEffect(() => {
    const mapLayout = mapLayoutRef.current;
    const zoomControl = zoomControlRef.current;
    const map = mapLayout?.querySelector<HTMLElement>('.map-of-seats');
    const slider = zoomControl?.querySelector<HTMLElement>('.totem-zoom-control__slider');
    if (!hasExternalMouse || !map || !zoomControl || !slider) return undefined;

    const updateZoomControlHeight = () => {
      if (window.innerWidth > COMPACT_ZOOM_CONTROL_BREAKPOINT) {
        zoomControl.style.removeProperty('--ZoomControl-SliderHeight');
        return;
      }

      const controlNonSliderHeight = zoomControl.getBoundingClientRect().height
        - slider.getBoundingClientRect().height;
      const availableSliderHeight = Math.max(
        16,
        map.getBoundingClientRect().height - controlNonSliderHeight,
      );
      const sliderHeight = Math.min(
        DEFAULT_ZOOM_CONTROL_SLIDER_HEIGHT,
        availableSliderHeight,
      );
      zoomControl.style.setProperty('--ZoomControl-SliderHeight', `${sliderHeight}px`);
    };

    updateZoomControlHeight();
    const observer = new ResizeObserver(updateZoomControlHeight);
    observer.observe(map);
    window.addEventListener('resize', updateZoomControlHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateZoomControlHeight);
      zoomControl.style.removeProperty('--ZoomControl-SliderHeight');
    };
  }, [hasExternalMouse, orientation]);

  const handleSeatClick = (seatId: string, state: SeatItemData['state']) => {
    if (state === 'Selected' && selectedSeatItems.length >= maxSeatSelections) {
      showSeatLimitAlert();
      return false;
    }

    const seat = rows.flatMap((row) => row.seats).find((item) => item?.id === seatId);
    if (
      state === 'Selected'
      && seat
      && (seat.type === 'Companion' || seat.type === 'Wheelchair')
    ) {
      setPendingAccessibleSeat({ seatId, state, type: seat.type });
      return false;
    }

    setRows((currentRows) => currentRows.map((row) => ({
      ...row,
      seats: row.seats.map((seat) => seat?.id === seatId ? { ...seat, state } : seat),
    })));
    return true;
  };

  const confirmAccessibleSeat = () => {
    if (!pendingAccessibleSeat) return;
    setRows((currentRows) => currentRows.map((row) => ({
      ...row,
      seats: row.seats.map((seat) => seat?.id === pendingAccessibleSeat.seatId
        ? { ...seat, state: pendingAccessibleSeat.state }
        : seat),
    })));
    setPendingAccessibleSeat(null);
  };

  const handleAdvance = () => {
    if (selectedSeatItems.length === 0) {
      setIsNoSeatDialogOpen(true);
      return;
    }

    if (onAdvance) {
      onAdvance();
      return;
    }
    navigate('/purchase/movies/tickets');
  };

  return (
    <div data-purchase-page className={`movie-seat-selection-page movie-seat-selection-page--${orientation}${isWideDevice ? ' movie-seat-selection-page--wide-device' : ''}${remainingSalesMinutes !== null ? ' movie-seat-selection-page--sales-closing' : ''}${seatLimitAlertVisible ? ' movie-seat-selection-page--seat-limit' : ''}${isPageLoading ? ' page-loading-active' : ''}`}>
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

      <main className="movie-seat-selection-page__main">
        <div className="movie-seat-selection-page__layout">
          <PreCheckoutSummary
            showEndTime={showEstimatedEndTime}
            className="movie-seat-selection-page__summary"
            movieName="A Odisséia"
            genre="Aventura"
            duration="180"
            formatDurationToMinutes={formatDurationToMinutes}
            date="2026-07-20"
            startTime={sessionStartTime ?? '10:00'}
            auditorium="5"
            language="Dublado"
            experiences={['2D', 'VIP', 'Laser']}
            selectedSeats={selectedSeats}
            showSelectedSeats
            posterImageUrl={AOdisseiaPoster}
            posterTagLabel="Estreia"
            posterRatingValue="18"
            showPosterTag
            showPosterRating
          />

          <section className="movie-seat-selection-page__seats" aria-labelledby="seat-selection-title">
            <div className="movie-seat-selection-page__seats-main">
              <h1 id="seat-selection-title">{t('seats.choose')}</h1>
              <div
                className={`movie-seat-selection-page__zoom${hasExternalMouse ? ' movie-seat-selection-page__zoom--external-mouse' : ''}`}
                aria-label={t('seats.zoomAria')}
              >
                {hasExternalMouse ? <MouseIcon aria-hidden="true" /> : <PinchIcon aria-hidden="true" />}
                <span>
                  {hasExternalMouse
                    ? t('seats.zoomMouse')
                    : t('seats.zoomTouch')}
                </span>
              </div>

              <div
                ref={mapLayoutRef}
                className={`movie-seat-selection-page__map-layout${hasExternalMouse ? ' movie-seat-selection-page__map-layout--with-controls' : ''}`}
              >
                <MapOfSeats
                  rows={rows}
                  onSeatClick={handleSeatClick}
                  fitToContainer
                  fillWidthAtOrBelow={orientation === 'horizontal' ? 1366 : undefined}
                  zoom={mapZoom}
                  onZoomChange={setMapZoom}
                />
                {hasExternalMouse && (
                  <ZoomControl
                    ref={zoomControlRef}
                    className="movie-seat-selection-page__zoom-control"
                    value={(mapZoom - 1) / 2}
                    onZoomIn={() => setMapZoom((currentZoom) => Math.min(3, currentZoom + 0.25))}
                    onZoomOut={() => setMapZoom((currentZoom) => Math.max(1, currentZoom - 0.25))}
                    onValueChange={(value) => setMapZoom(1 + (value * 2))}
                  />
                )}
              </div>
            </div>

            <aside className="movie-seat-selection-page__legend" aria-label={t('seats.legendAria')}>
              <h2>{t('seats.legend')}</h2>
              <div className="movie-seat-selection-page__legend-grid">
                {seatLegend.map((item) => (
                  <Legend
                    key={item.labelKey}
                    indicatorElement={<Seat context="Legend" type={item.type} state={item.state} />}
                    description={t(item.labelKey)}
                    textSize="Body-sm"
                  />
                ))}
              </div>
            </aside>
          </section>
        </div>

        {remainingSalesMinutes !== null && (
          <PurchaseSessionClosingAlert remainingMinutes={remainingSalesMinutes} />
        )}

        {seatLimitAlertVisible && <SeatLimitAlert limit={maxSeatSelections} onClose={hideSeatLimitAlert} />}
      </main>

      <Footer showCenterAction={false} price="0,00" onMainAction={handleAdvance} />

      <OverlaySurface
        open={isNoSeatDialogOpen}
        kind="modal"
        orientation={orientation}
        onClose={() => setIsNoSeatDialogOpen(false)}
      >
        <ActionDialog
          size="md"
          illustration={<NoSeatIllustration aria-hidden="true" />}
          title={t('seats.noneSelectedTitle')}
          description={t('seats.noneSelectedDescription')}
          primaryActionLabel={t('seats.selectSeats')}
          showSecondaryButton={false}
          onPrimaryAction={() => setIsNoSeatDialogOpen(false)}
        />
      </OverlaySurface>

      <OverlaySurface
        open={pendingAccessibleSeat !== null}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setPendingAccessibleSeat(null)}
      >
        <ActionDialog
          size="md"
          illustration={pendingAccessibleSeat?.type === 'Companion'
            ? <CompanionSeatIllustration aria-hidden="true" />
            : <WheelchairSeatIllustration aria-hidden="true" />}
          title={pendingAccessibleSeat?.type === 'Companion'
            ? t('seats.companionWarningTitle')
            : t('seats.wheelchairWarningTitle')}
          description={pendingAccessibleSeat?.type === 'Companion'
            ? t('seats.companionWarningDescription')
            : t('seats.wheelchairWarningDescription')}
          secondaryActionLabel={t('seats.changeSeat')}
          primaryActionLabel={t('seats.continue')}
          onSecondaryAction={() => setPendingAccessibleSeat(null)}
          onPrimaryAction={confirmAccessibleSeat}
        />
      </OverlaySurface>
    </div>
  );
}

