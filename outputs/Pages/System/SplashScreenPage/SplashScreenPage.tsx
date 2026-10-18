import { BrandLogo } from '@components/BrandLogo/BrandLogo';
import { ProgressBar } from '@components/Common/ProgressBar';
import { useOrientation } from '../../useOrientation';
import './SplashScreenPage.css';

export interface SplashScreenPageProps {
  /** Loading progress supplied by the application, clamped by ProgressBar from 0 to 100. */
  progress?: number;
}

export function SplashScreenPage({ progress = 0 }: SplashScreenPageProps) {
  const orientation = useOrientation();

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
          progress={progress}
          aria-label="Progresso da inicialização"
        />
      </div>
    </main>
  );
}

SplashScreenPage.displayName = 'SplashScreenPage';
