import {
  Children,
  isValidElement,
  useState,
  useRef,
  useEffect,
  type ReactElement,
  type ReactNode,
  type HTMLAttributes,
  type UIEvent,
  type PointerEvent,
  type MouseEvent,
} from 'react';
import { PaginationButton } from '../PaginationButton';
import {
  ShowtimeButton,
  isShowtimeAvailable,
  useShowtimeClock,
  type ShowtimeButtonProps,
} from '../ShowtimeButton';
import ChevronLeftIcon from '@icons/chevron-left.svg';
import ChevronRightIcon from '@icons/chevron-right.svg';
import './ShowtimeCarousel.css';

export interface ShowtimeCarouselProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Advances the carousel by a complete visible page when defined. */
  itemsPerPage?: number;
  /** Enables pointer dragging. Disable when the carousel items must receive every click. */
  dragEnabled?: boolean;
  children?: ReactNode;
}

function isShowtimeButtonElement(child: ReactNode): child is ReactElement<ShowtimeButtonProps> {
  return isValidElement<ShowtimeButtonProps>(child) && child.type === ShowtimeButton;
}

export const ShowtimeCarousel = ({
  orientation = 'horizontal',
  itemsPerPage,
  dragEnabled = true,
  children,
  className,
  ...nativeProps
}: ShowtimeCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const childItems = Children.toArray(children);
  const showtimeDescriptors = childItems
    .filter(isShowtimeButtonElement)
    .map(({ props }) => ({
      time: props.time ?? '10:00',
      showtimeDate: props.showtimeDate,
      salesCutoffMinutes: props.salesCutoffMinutes,
      availableSeats: props.availableSeats,
    }));
  const nowTimestamp = useShowtimeClock(showtimeDescriptors);
  const visibleChildren = childItems.filter((child) => (
    !isShowtimeButtonElement(child)
    || isShowtimeAvailable({
      time: child.props.time ?? '10:00',
      showtimeDate: child.props.showtimeDate,
      salesCutoffMinutes: child.props.salesCutoffMinutes,
      availableSeats: child.props.availableSeats,
    }, nowTimestamp)
  ));

  // Drag Logic States
  const [isDragging, setIsDragging] = useState(false);
  const isPointerDown = useRef(false);
  const hasDragged = useRef(false);
  const suppressClick = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const dragActivationThreshold = 6;

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

    setCanScrollPrev(Math.ceil(scrollLeft) > 1);
    setCanScrollNext(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const observer = new ResizeObserver(() => checkScroll());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [orientation, children, visibleChildren.length]);

  // CRITICAL FIX: Find the EXACT absolute position of the closest target child.
  // This satisfies the browser's snap engine perfectly, preventing hover-clipping and erratic jumps.
  const scrollByAmount = (direction: 'prev' | 'next', baseLeft?: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const currentScroll = baseLeft !== undefined ? baseLeft : container.scrollLeft;
    const usesFullPageNavigation = itemsPerPage !== undefined
      || (orientation === 'vertical' && window.innerWidth >= 1080);
    const idealJump = container.clientWidth * (usesFullPageNavigation ? 1 : 0.8);
    const idealTarget = direction === 'next' ? currentScroll + idealJump : currentScroll - idealJump;

    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    let closestChild = children[0];
    let minDiff = Infinity;
    const trackRect = container.getBoundingClientRect();

    for (const child of children) {
      const childRect = child.getBoundingClientRect();
      // Calculate child's absolute scroll position inside the track
      const childAbsoluteLeft = (childRect.left - trackRect.left) + container.scrollLeft;

      const diff = Math.abs(childAbsoluteLeft - idealTarget);
      if (diff < minDiff) {
        minDiff = diff;
        closestChild = child;
      }
    }

    // Grab the exact boundary of the best-matched child and scroll precisely to it
    const exactTarget = (closestChild.getBoundingClientRect().left - trackRect.left) + container.scrollLeft;
    container.scrollTo({ left: exactTarget, behavior: 'smooth' });
  };

  // Buttons trigger standard logic
  const scrollPrev = () => scrollByAmount('prev');
  const scrollNext = () => scrollByAmount('next');

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled) return;
    if (!containerRef.current) return;
    isPointerDown.current = true;
    hasDragged.current = false;
    suppressClick.current = false;
    startX.current = e.pageX;
    startScrollLeft.current = containerRef.current.scrollLeft;
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled) return;
    if (!isPointerDown.current || !containerRef.current) return;
    const walk = e.pageX - startX.current;

    if (!hasDragged.current && Math.abs(walk) < dragActivationThreshold) return;

    if (!hasDragged.current) {
      hasDragged.current = true;
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    e.preventDefault();
    containerRef.current.scrollLeft = startScrollLeft.current - walk;
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled) return;
    if (!isPointerDown.current || !containerRef.current) return;
    const didDrag = hasDragged.current;
    isPointerDown.current = false;
    hasDragged.current = false;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!didDrag) return;

    suppressClick.current = true;

    const walk = e.pageX - startX.current;
    const threshold = 50;

    const { scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const allowedToNext = startScrollLeft.current < maxScroll - 1;
    const allowedToPrev = startScrollLeft.current > 1;

    // Swipe inherits the EXACT behavior of the navigation buttons, 
    // calculated from the point where the drag started.
    if (walk < -threshold && allowedToNext) {
      scrollByAmount('next', startScrollLeft.current);
    } else if (walk > threshold && allowedToPrev) {
      scrollByAmount('prev', startScrollLeft.current);
    } else {
      // Revert if threshold not met
      containerRef.current.scrollTo({ left: startScrollLeft.current, behavior: 'smooth' });
    }
  };

  const handleClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  if (visibleChildren.length === 0) return null;

  return (
    <div
      className={`totem-showtime-carousel totem-showtime-carousel--${orientation} ${className || ''}`.trim()}
      data-drag-enabled={dragEnabled}
      data-items-per-page={itemsPerPage}
      {...nativeProps}
    >
      <div className="totem-showtime-carousel__arrow">
        <PaginationButton
          direction="left"
          icon={<ChevronLeftIcon />}
          disabled={!canScrollPrev}
          onClick={scrollPrev}
          aria-label="Scroll left"
          aria-hidden={!canScrollPrev}
        />
      </div>

      <div
        className={`totem-showtime-carousel__track ${isDragging ? 'is-dragging' : ''}`.trim()}
        ref={containerRef}
        onScroll={(e: UIEvent<HTMLDivElement>) => {
          checkScroll();
          nativeProps.onScroll?.(e);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        {visibleChildren}
      </div>

      <div className="totem-showtime-carousel__arrow">
        <PaginationButton
          direction="right"
          icon={<ChevronRightIcon />}
          disabled={!canScrollNext}
          onClick={scrollNext}
          aria-label="Scroll right"
          aria-hidden={!canScrollNext}
        />
      </div>
    </div>
  );
};
