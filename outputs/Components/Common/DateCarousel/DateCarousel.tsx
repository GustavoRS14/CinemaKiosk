import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { DateComponent } from '../Date';
import { PaginationButton } from '../PaginationButton';
import { useI18n } from '../../../i18n';
import './DateCarousel.css';

export type DateCarouselItem = {
  id: string;
  day: string;
  date: string;
  month: string;
};

export type DateCarouselProps = {
  items: readonly DateCarouselItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  ariaLabel?: string;
};

const EDGE_TOLERANCE = 2;
const DRAG_THRESHOLD = 6;

export function DateCarousel({
  items,
  selectedId,
  onSelect,
  className = '',
  ariaLabel,
}: DateCarouselProps) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ pointerId: -1, startX: 0, startScrollLeft: 0, moved: false });
  const suppressClickRef = useRef(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canGoPrevious, setCanGoPrevious] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const updateNavigationState = useCallback(() => {
    const viewport = viewportRef.current;
    const root = rootRef.current;
    const track = trackRef.current;
    if (!viewport || !root || !track) return;

    const overflow = track.scrollWidth > root.clientWidth + EDGE_TOLERANCE;
    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    setHasOverflow(overflow);
    setCanGoPrevious(overflow && viewport.scrollLeft > EDGE_TOLERANCE);
    setCanGoNext(overflow && viewport.scrollLeft < maxScrollLeft - EDGE_TOLERANCE);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    updateNavigationState();
    const resizeObserver = new ResizeObserver(updateNavigationState);
    if (rootRef.current) resizeObserver.observe(rootRef.current);
    if (trackRef.current) resizeObserver.observe(trackRef.current);
    viewport.addEventListener('scroll', updateNavigationState, { passive: true });

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', updateNavigationState);
    };
  }, [items, updateNavigationState]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !selectedId) return;
    const selectedItem = viewport.querySelector<HTMLElement>(`[data-date-carousel-id="${CSS.escape(selectedId)}"]`);
    if (!selectedItem) return;

    const itemStart = selectedItem.offsetLeft;
    const itemEnd = itemStart + selectedItem.offsetWidth;
    const viewportStart = viewport.scrollLeft;
    const viewportEnd = viewportStart + viewport.clientWidth;

    if (itemStart < viewportStart) viewport.scrollTo({ left: itemStart, behavior: 'smooth' });
    else if (itemEnd > viewportEnd) viewport.scrollTo({ left: itemEnd - viewport.clientWidth, behavior: 'smooth' });
  }, [items, selectedId]);

  const goToAdjacentPage = (direction: 'previous' | 'next') => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const firstItem = viewport.querySelector<HTMLElement>('.date-carousel__item');
    const styles = getComputedStyle(viewport.firstElementChild ?? viewport);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const itemStep = (firstItem?.offsetWidth ?? 71) + gap;
    const pageDistance = Math.max(itemStep, viewport.clientWidth - itemStep);
    const itemCount = Math.max(1, Math.floor(pageDistance / itemStep));
    viewport.scrollBy({
      left: itemCount * itemStep * (direction === 'next' ? 1 : -1),
      behavior: 'smooth',
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !hasOverflow) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      moved: false,
    };
    viewport.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!viewport || drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) >= DRAG_THRESHOLD) drag.moved = true;
    viewport.scrollLeft = drag.startScrollLeft - distance;
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!viewport || drag.pointerId !== event.pointerId) return;

    suppressClickRef.current = drag.moved;
    dragRef.current.pointerId = -1;
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    updateNavigationState();
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  return (
    <div
      ref={rootRef}
      className={`date-carousel${hasOverflow ? ' date-carousel--overflowing' : ''} ${className}`.trim()}
      role="region"
      aria-label={ariaLabel}
    >
      {hasOverflow && (
        <PaginationButton
          direction="left"
          disabled={!canGoPrevious}
          onClick={() => goToAdjacentPage('previous')}
        />
      )}

      <div
        ref={viewportRef}
        className="date-carousel__viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={handleClickCapture}
      >
        <div ref={trackRef} className="date-carousel__track">
          {items.map(({ id, ...date }) => (
            <div className="date-carousel__item" data-date-carousel-id={id} key={id}>
              <DateComponent
                {...date}
                day={id.slice(0, 10) === todayKey ? t('calendar.today') : date.day}
                selected={selectedId === id}
                onClick={() => onSelect?.(id)}
              />
            </div>
          ))}
        </div>
      </div>

      {hasOverflow && (
        <PaginationButton
          direction="right"
          disabled={!canGoNext}
          onClick={() => goToAdjacentPage('next')}
        />
      )}
    </div>
  );
}

DateCarousel.displayName = 'DateCarousel';

