import React, { useEffect, useRef, useState } from 'react';
import { Seat } from '../Seat';
import { useI18n } from '../../../i18n';
import './MapOfSeats.css';

export type SeatItemData = {
  id: string;
  seatNumber: string;
  type: 'Standard' | 'Obese' | 'Wheelchair' | 'Companion' | 'VIP' | 'Super';
  state: 'Available' | 'Selected' | 'Occupied';
};

export type SeatRowData = {
  rowLabel: string;
  seats: (SeatItemData | null)[];
};

export interface MapOfSeatsProps {
  className?: string;
  rows?: SeatRowData[];
  onSeatClick?: (seatId: string, newState: 'Available' | 'Selected' | 'Occupied') => boolean | void;
  /** Enables automatic fitting of the complete map inside its container. */
  fitToContainer?: boolean;
  /** Below this viewport width the map may also grow to fill the available width. */
  fillWidthAtOrBelow?: number;
  /** Controlled zoom value. Values are clamped between 1 and 3. */
  zoom?: number;
  /** Notifies consumers when wheel, pinch, or external controls change the zoom. */
  onZoomChange?: (zoom: number) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

type PointerPosition = { x: number; y: number };

const getDistance = (points: PointerPosition[]) => {
  const [first, second] = points;
  return Math.hypot(second.x - first.x, second.y - first.y);
};

export const MapOfSeats: React.FC<MapOfSeatsProps> = ({
  className = '',
  rows = [],
  onSeatClick,
  fitToContainer = true,
  fillWidthAtOrBelow,
  zoom: controlledZoom,
  onZoomChange,
}) => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const activePointersRef = useRef(new Map<number, PointerPosition>());
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(1);
  const zoomRef = useRef(1);
  const fitScaleRef = useRef(1);
  const panRef = useRef<PointerPosition>({ x: 0, y: 0 });
  const didDragRef = useRef(false);
  const [internalZoom, setInternalZoom] = useState(1);
  const zoom = controlledZoom === undefined ? internalZoom : clampZoom(controlledZoom);
  const [fitScale, setFitScale] = useState(1);
  const [contentNaturalWidth, setContentNaturalWidth] = useState<number | null>(null);
  const [fittedHeight, setFittedHeight] = useState<number | null>(null);
  const [pan, setPan] = useState<PointerPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const applyPan = (
    nextPan: PointerPosition,
    targetZoom = zoomRef.current,
    targetFitScale = fitScaleRef.current,
  ) => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      panRef.current = { x: 0, y: 0 };
      setPan(panRef.current);
      return;
    }

    const contentWidth = Math.max(content.offsetWidth, content.scrollWidth);
    const contentHeight = Math.max(content.offsetHeight, content.scrollHeight);
    const renderedScale = targetZoom * targetFitScale;
    const maxX = Math.max(0, (contentWidth * renderedScale - container.clientWidth) / 2);
    const maxY = Math.max(0, (contentHeight * renderedScale - container.clientHeight) / 2);
    const clampedPan = {
      x: Math.min(maxX, Math.max(-maxX, nextPan.x)),
      y: Math.min(maxY, Math.max(-maxY, nextPan.y)),
    };

    panRef.current = clampedPan;
    setPan(clampedPan);
  };

  const applyZoom = (nextZoom: number) => {
    const clampedZoom = clampZoom(nextZoom);
    zoomRef.current = clampedZoom;
    if (controlledZoom === undefined) setInternalZoom(clampedZoom);
    onZoomChange?.(clampedZoom);
    applyPan(panRef.current, clampedZoom);
  };

  useEffect(() => {
    if (controlledZoom === undefined) return;
    const nextZoom = clampZoom(controlledZoom);
    zoomRef.current = nextZoom;
    applyPan(panRef.current, nextZoom);
  }, [controlledZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && zoomRef.current === MIN_ZOOM) return;

      event.preventDefault();
      const zoomFactor = Math.exp(-event.deltaY * 0.0015);
      applyZoom(zoomRef.current * zoomFactor);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const grid = gridRef.current;
    if (!container || !content || !grid) return undefined;

    const updateFitScale = () => {
      if (!fitToContainer) {
        setContentNaturalWidth(null);
        setFittedHeight(null);
        fitScaleRef.current = 1;
        setFitScale(1);
        applyPan({ x: 0, y: 0 }, zoomRef.current, 1);
        return;
      }

      const screenWrapper = content.querySelector<HTMLElement>('.map-of-seats__screen-wrapper');
      const naturalWidth = Math.max(
        grid.offsetWidth,
        grid.scrollWidth,
        screenWrapper?.scrollWidth ?? 0,
      );
      if (naturalWidth <= 0 || container.clientWidth <= 0) return;

      const widthRatio = container.clientWidth / naturalWidth;
      const shouldFillWidth = fillWidthAtOrBelow !== undefined
        && window.innerWidth <= fillWidthAtOrBelow;
      const nextFitScale = shouldFillWidth ? widthRatio : Math.min(1, widthRatio);
      const naturalHeight = Math.max(content.offsetHeight, content.scrollHeight);
      setContentNaturalWidth(naturalWidth);
      setFittedHeight(naturalHeight * nextFitScale);
      fitScaleRef.current = nextFitScale;
      setFitScale(nextFitScale);
      applyPan(panRef.current, zoomRef.current, nextFitScale);
    };

    updateFitScale();
    const observer = new ResizeObserver(updateFitScale);
    observer.observe(container);
    observer.observe(content);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [fillWidthAtOrBelow, fitToContainer]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && (event.button !== 0 || zoomRef.current === MIN_ZOOM)) return;
    if (event.pointerType !== 'mouse' && event.pointerType !== 'touch') return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const pointer = { x: event.clientX, y: event.clientY };
    activePointersRef.current.set(event.pointerId, pointer);
    didDragRef.current = false;

    if (activePointersRef.current.size === 2) {
      pinchStartDistanceRef.current = getDistance(Array.from(activePointersRef.current.values()));
      pinchStartZoomRef.current = zoomRef.current;
      setIsDragging(false);
    } else if (zoomRef.current > MIN_ZOOM) {
      setIsDragging(true);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return;

    const previousPointer = activePointersRef.current.get(event.pointerId);
    const currentPointer = { x: event.clientX, y: event.clientY };
    activePointersRef.current.set(event.pointerId, currentPointer);

    if (activePointersRef.current.size === 2 && pinchStartDistanceRef.current !== null) {
      event.preventDefault();
      const currentDistance = getDistance(Array.from(activePointersRef.current.values()));
      applyZoom(pinchStartZoomRef.current * (currentDistance / pinchStartDistanceRef.current));
      return;
    }

    if (zoomRef.current > MIN_ZOOM && previousPointer) {
      event.preventDefault();
      const deltaX = currentPointer.x - previousPointer.x;
      const deltaY = currentPointer.y - previousPointer.y;
      if (deltaX !== 0 || deltaY !== 0) didDragRef.current = true;
      applyPan({ x: panRef.current.x + deltaX, y: panRef.current.y + deltaY });
    }
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStartDistanceRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      setIsDragging(false);
    } else {
      setIsDragging(zoomRef.current > MIN_ZOOM);
    }
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!didDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    didDragRef.current = false;
  };

  // CRITICAL FIX: Scans map to check if ANY native Standard seats exist
  const hasStandardSeats = rows.some((row) =>
    row.seats.some((seat) => seat !== null && seat.type === 'Standard')
  );

  // VIP logic fallback
  const getSeatDisplayType = (seatType: SeatItemData['type']): SeatItemData['type'] => {
    if (seatType === 'VIP' && !hasStandardSeats) {
      return 'Standard';
    }
    return seatType;
  };

  return (
    <div
      ref={containerRef}
      className={`map-of-seats${zoom > MIN_ZOOM ? ' map-of-seats--zoomed' : ''}${isDragging ? ' map-of-seats--dragging' : ''} ${className}`.trim()}
      style={{ height: fittedHeight === null ? undefined : `${fittedHeight}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClickCapture={handleClickCapture}
    >
      <div
        ref={contentRef}
        className="map-of-seats__zoom-content"
        style={{
          width: contentNaturalWidth === null ? undefined : `${contentNaturalWidth}px`,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${fitScale * zoom})`,
        }}
      >
        <div ref={gridRef} className="map-of-seats__grid">
          {rows.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="map-of-seats__row">
              <span className="map-of-seats__row-label">{row.rowLabel}</span>

              <div className="map-of-seats__seats-container">
                {row.seats.map((seat, seatIndex) => {
                  // Renders the precise aisle gap safely driven by API nulls
                  if (!seat) {
                    return <div key={`space-${rowIndex}-${seatIndex}`} className="map-of-seats__spacer" />;
                  }

                  return (
                    <Seat
                      key={seat.id}
                      context="Map"
                      seatNumber={seat.seatNumber}
                      state={seat.state}
                      type={getSeatDisplayType(seat.type)}
                      onClick={(newState) => onSeatClick?.(seat.id, newState)}
                    />
                  );
                })}
              </div>

              <span className="map-of-seats__row-label">{row.rowLabel}</span>
            </div>
          ))}
        </div>

        <div className="map-of-seats__screen-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 764 42"
            fill="none"
            className="map-of-seats__screen-svg"
          >
            <path
              d="M2.00043 2.00037C2.00043 2.00037 175.949 40.0004 383.115 40.0004C590.28 40.0004 762 2.00037 762 2.00037"
              strokeLinecap="round"
            />
          </svg>
          <span className="map-of-seats__screen-text">{t('seats.screen')}</span>
        </div>
      </div>
    </div>
  );
};
