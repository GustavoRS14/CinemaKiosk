import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { PageOrientation } from '../../../Pages/useOrientation';
import { useI18n } from '../../../i18n';
import './OverlaySurface.css';

export type OverlaySurfaceProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  kind?: 'modal' | 'slideover';
  orientation?: PageOrientation;
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  modalPlacement?: 'center' | 'above-navigation';
  portal?: boolean;
};

const MOTION_DURATION_MS = 300;
type MotionPhase = 'idle' | 'entering' | 'open' | 'exiting';

export function OverlaySurface({
  open,
  onClose,
  children,
  kind = 'modal',
  orientation = 'horizontal',
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
  modalPlacement = 'center',
  portal = false,
}: OverlaySurfaceProps) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(open);
  const [motionPhase, setMotionPhase] = useState<MotionPhase>(open ? 'entering' : 'idle');
  const surfaceRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const restoreFocusTimeoutRef = useRef<number | undefined>(undefined);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      setMounted(true);
      setMotionPhase('entering');
      const entranceTimeout = window.setTimeout(
        () => setMotionPhase('open'),
        MOTION_DURATION_MS,
      );
      return () => window.clearTimeout(entranceTimeout);
    }

    if (!mounted) {
      setMotionPhase('idle');
      return;
    }

    setMotionPhase('exiting');
    const timeout = window.setTimeout(() => {
      setMounted(false);
      setMotionPhase('idle');
    }, MOTION_DURATION_MS);
    return () => window.clearTimeout(timeout);
    // `mounted` intentionally stays outside the dependency list: open/close owns
    // the complete motion lifecycle and must not restart during phase updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    if (restoreFocusTimeoutRef.current !== undefined) {
      window.clearTimeout(restoreFocusTimeoutRef.current);
      restoreFocusTimeoutRef.current = undefined;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimeout = window.setTimeout(() => {
      if (surfaceRef.current && !surfaceRef.current.contains(document.activeElement)) {
        surfaceRef.current.focus({ preventScroll: true });
      }
    }, 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimeout);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusTimeoutRef.current = window.setTimeout(() => {
        if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
        restoreFocusTimeoutRef.current = undefined;
      }, 0);
    };
  }, [closeOnEscape, mounted]);

  if (!mounted) return null;

  const isActive = motionPhase === 'entering' || motionPhase === 'open';

  const surface = (
    <div
      className={`overlay-surface overlay-surface--${kind} overlay-surface--${orientation} overlay-surface--placement-${modalPlacement}${isActive ? ' overlay-surface--visible' : ''} ${className}`.trim()}
      data-state={motionPhase === 'open' ? 'open' : 'animating'}
      data-motion={motionPhase}
    >
      <button
        type="button"
        className="overlay-surface__backdrop"
        aria-label={t('common.close')}
        tabIndex={-1}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={surfaceRef}
        className="overlay-surface__panel"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );

  const themedPortalRoot = typeof document !== 'undefined'
    ? document.querySelector('[data-theme], .admin-panel-page, .onboarding-location-page, .onboarding-activation-page, .customer-home-page, .concessions-page, [data-purchase-page], .page-wrapper')
    : null;

  return portal && typeof document !== 'undefined'
    ? createPortal(surface, themedPortalRoot ?? document.body)
    : surface;
}
