import OfflineIllustration from '@illustrations/Offline.svg';
import { Header } from '@components/Layout/Header';
import { MetadataBar } from '@components/Layout/MetadataBar/MetadataBar';
import { useOrientation } from '../../../useOrientation';
import { useI18n } from '../../../../i18n';
import './OfflinePage.css';

export function OfflinePage() {
  const orientation = useOrientation();
  const { t } = useI18n();

  return (
    <div className={`offline-page offline-page--${orientation}`}>
      <Header context="Customer" type="Offline" />

      <main className="offline-page__main" aria-labelledby="offline-page-title">
        <div className="offline-page__message">
          <OfflineIllustration className="offline-page__illustration" aria-hidden="true" />

          <div className="offline-page__copy">
            <h1 id="offline-page-title">{t('offline.title')}</h1>
            <p>{t('offline.description')}</p>
          </div>
        </div>
      </main>

      <MetadataBar version="V 1.0.0.1" />
    </div>
  );
}
