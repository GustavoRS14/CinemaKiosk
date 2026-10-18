import {
  forwardRef,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { IconButton } from '../IconButton';
import AddPlusIcon from '@icons/add-plus.svg';
import MinusIcon from '@icons/minus.svg';
import './ZoomControl.css';
import { useI18n } from '../../../i18n';

export type ZoomControlProps = HTMLAttributes<HTMLDivElement> & {
  /** Normalized zoom position, where 0 is minimum and 1 is maximum. */
  value?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  /** Receives the normalized value while the slider indicator is dragged. */
  onValueChange?: (value: number) => void;
};

export const ZoomControl = forwardRef<HTMLDivElement, ZoomControlProps>(function ZoomControl(
  { className, value = 0, onZoomIn, onZoomOut, onValueChange, ...nativeProps },
  ref
) {
  const { t } = useI18n();
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragOffsetYRef = useRef(0);
  const normalizedValue = Math.min(1, Math.max(0, value));
  const isMinimum = normalizedValue <= 0;
  const isMaximum = normalizedValue >= 1;

  const updateValueFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider || !onValueChange) return;

    const sliderBounds = slider.getBoundingClientRect();
    const indicatorSize = 16;
    const availableTravel = Math.max(1, sliderBounds.height - indicatorSize);
    const indicatorCenterY = event.clientY - dragOffsetYRef.current;
    const nextValue = 1 - ((indicatorCenterY - sliderBounds.top - (indicatorSize / 2)) / availableTravel);
    onValueChange(Math.min(1, Math.max(0, nextValue)));
  };

  const handleIndicatorPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!onValueChange) return;
    event.preventDefault();
    const indicatorBounds = event.currentTarget.getBoundingClientRect();
    dragOffsetYRef.current = event.clientY - (indicatorBounds.top + (indicatorBounds.height / 2));
    event.currentTarget.setPointerCapture(event.pointerId);
    updateValueFromPointer(event);
  };

  const handleIndicatorPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    updateValueFromPointer(event);
  };

  const handleIndicatorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onValueChange) return;

    const keyboardValues: Partial<Record<string, number>> = {
      ArrowUp: normalizedValue + 0.125,
      ArrowRight: normalizedValue + 0.125,
      ArrowDown: normalizedValue - 0.125,
      ArrowLeft: normalizedValue - 0.125,
      Home: 0,
      End: 1,
    };
    const nextValue = keyboardValues[event.key];
    if (nextValue === undefined) return;

    event.preventDefault();
    onValueChange(Math.min(1, Math.max(0, nextValue)));
  };

  return (
    <div
      {...nativeProps}
      ref={ref}
      className={`totem-zoom-control ${className || ''}`.trim()}
    >
      <IconButton
        icon={<AddPlusIcon />}
        aria-label={t('common.zoomIn')}
        onClick={onZoomIn}
        state={isMaximum ? 'Disabled' : 'Default'}
        disabled={isMaximum}
      />
      <div ref={sliderRef} className="totem-zoom-control__slider">
        <div
          className={`totem-zoom-control__indicator${onValueChange ? ' totem-zoom-control__indicator--interactive' : ''}`}
          style={{ bottom: `calc(${normalizedValue * 100}% - ${normalizedValue * 16}px)` }}
          role={onValueChange ? 'slider' : undefined}
          tabIndex={onValueChange ? 0 : undefined}
          aria-label={onValueChange ? t('common.zoomLevel') : undefined}
          aria-valuemin={onValueChange ? 0 : undefined}
          aria-valuemax={onValueChange ? 100 : undefined}
          aria-valuenow={onValueChange ? Math.round(normalizedValue * 100) : undefined}
          aria-orientation={onValueChange ? 'vertical' : undefined}
          onPointerDown={handleIndicatorPointerDown}
          onPointerMove={handleIndicatorPointerMove}
          onKeyDown={handleIndicatorKeyDown}
        />
      </div>
      <IconButton
        icon={<MinusIcon />}
        aria-label={t('common.zoomOut')}
        onClick={onZoomOut}
        state={isMinimum ? 'Disabled' : 'Default'}
        disabled={isMinimum}
      />
    </div>
  );
});

ZoomControl.displayName = 'ZoomControl';
