import { useEffect, useRef, useState } from 'react';
import { LoadingAnimation } from '../LoadingAnimation';
import './PageLoadingScreen.css';

export interface PageLoadingScreenProps {
  active: boolean;
  modalAbove?: boolean;
}

const PAGE_CONTENT_PRELOAD_RESET_EVENT = 'totem-page-content-preload-reset';
let pageContentPreloadGeneration = 0;

export function resetPageContentPreload() {
  pageContentPreloadGeneration += 1;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PAGE_CONTENT_PRELOAD_RESET_EVENT, {
      detail: pageContentPreloadGeneration,
    }));
  }
}

const waitForImage = (image: HTMLImageElement) => {
  const decodeImage = () => {
    if (typeof image.decode !== 'function' || image.naturalWidth === 0) return Promise.resolve();
    return image.decode().catch(() => undefined);
  };

  if (image.complete) return decodeImage();

  return new Promise<void>((resolve) => {
    image.addEventListener('load', () => {
      void decodeImage().then(resolve);
    }, { once: true });
    image.addEventListener('error', () => resolve(), { once: true });
  });
};

const waitForBrowserPaint = () => new Promise<void>((resolve) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => resolve());
  });
});

export function usePageLoadingScreen(minimumDuration = 1500) {
  const [isLoading, setIsLoading] = useState(true);
  const [preloadGeneration, setPreloadGeneration] = useState(pageContentPreloadGeneration);

  useEffect(() => {
    const resetPreload = (event: Event) => {
      const nextGeneration = event instanceof CustomEvent && typeof event.detail === 'number'
        ? event.detail
        : pageContentPreloadGeneration;
      setIsLoading(true);
      setPreloadGeneration(nextGeneration);
    };

    window.addEventListener(PAGE_CONTENT_PRELOAD_RESET_EVENT, resetPreload);
    return () => window.removeEventListener(PAGE_CONTENT_PRELOAD_RESET_EVENT, resetPreload);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    let cancelled = false;
    let finishTimer: number | undefined;
    const startedAt = window.performance.now();

    const finishWhenReady = async () => {
      const imageReadiness = Promise.all(Array.from(document.images, waitForImage));
      const fontReadiness = document.fonts?.ready ?? Promise.resolve();

      await Promise.all([imageReadiness, fontReadiness]);
      await waitForBrowserPaint();
      if (cancelled) return;

      const remainingDuration = Math.max(0, minimumDuration - (window.performance.now() - startedAt));
      finishTimer = window.setTimeout(() => {
        if (!cancelled) setIsLoading(false);
      }, remainingDuration);
    };

    const handleWindowLoad = () => {
      void finishWhenReady();
    };

    if (document.readyState === 'complete') {
      void finishWhenReady();
    } else {
      window.addEventListener('load', handleWindowLoad, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', handleWindowLoad);
      if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    };
  }, [minimumDuration, preloadGeneration]);

  return isLoading;
}

export function PageLoadingScreen({ active, modalAbove = false }: PageLoadingScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return undefined;

    const screen = screenRef.current;
    const page = screen?.parentElement;
    if (!screen || !page) return undefined;

    const siblings = Array.from(page.children)
      .filter((element): element is HTMLElement => (
        element !== screen
        && element instanceof HTMLElement
        && !(
          modalAbove
          && element.matches('.overlay-surface, .modal-accessibility-trigger')
        )
      ))
      .map((element) => ({ element, wasInert: element.hasAttribute('inert') }));

    siblings.forEach(({ element }) => element.setAttribute('inert', ''));
    screen.focus({ preventScroll: true });

    return () => {
      siblings.forEach(({ element, wasInert }) => {
        if (!wasInert) element.removeAttribute('inert');
      });
    };
  }, [active, modalAbove]);

  if (!active) return null;

  return (
    <div
      ref={screenRef}
      className={`page-loading-screen${modalAbove ? ' page-loading-screen--below-modal' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Carregando conteúdo"
      tabIndex={-1}
    >
      <LoadingAnimation />
    </div>
  );
}
