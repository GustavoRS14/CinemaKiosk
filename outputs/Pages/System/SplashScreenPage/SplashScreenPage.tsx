import { useEffect, useState } from 'react';
import { BrandLogo } from '@components/BrandLogo/BrandLogo';
import { ProgressBar } from '@components/Common/ProgressBar';
import { useOrientation } from '../../useOrientation';
import './SplashScreenPage.css';

export interface SplashScreenPageProps {
  /** Loading progress supplied by the application, clamped by ProgressBar from 0 to 100. */
  progress?: number;
  /** Duration of the automatic startup progress when progress is not externally controlled. */
  durationMs?: number;
}

const STARTUP_DESTINATION_KEY = 'totem-startup-destination';

function navigateAfterStartup() {
  const destination = window.sessionStorage.getItem(STARTUP_DESTINATION_KEY) || '/';
  window.sessionStorage.removeItem(STARTUP_DESTINATION_KEY);
  window.history.replaceState({}, '', destination);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function SplashScreenPage({ progress, durationMs = 1800 }: SplashScreenPageProps) {
  const orientation = useOrientation();
  const [automaticProgress, setAutomaticProgress] = useState(0);
  const displayedProgress = progress ?? automaticProgress;

  useEffect(() => {
    if (progress !== undefined) {
      if (progress >= 100) navigateAfterStartup();
      return undefined;
    }

    const startedAt = performance.now();
    let animationFrame = 0;
    const updateProgress = (now: number) => {
      const nextProgress = Math.min(100, ((now - startedAt) / durationMs) * 100);
      setAutomaticProgress(nextProgress);
      if (nextProgress >= 100) {
        navigateAfterStartup();
        return;
      }
      animationFrame = window.requestAnimationFrame(updateProgress);
    };
    animationFrame = window.requestAnimationFrame(updateProgress);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [durationMs, progress]);

  return (
    <main
      className={`splash-screen-page splash-screen-page--${orientation}`}
      data-orientation={orientation}
      aria-label="Inicialização do sistema"
    >
      <div className="splash-screen-page__content">
        <BrandLogo
          size="lg"
          type="Standard"
          format="Full"
          colorVariant="DefaultColor"
        />
        <ProgressBar
          className="splash-screen-page__progress"
          intent="Primary"
          progress={displayedProgress}
          aria-label="Progresso da inicialização"
        />
      </div>
    </main>
  );
}

SplashScreenPage.displayName = 'SplashScreenPage';
