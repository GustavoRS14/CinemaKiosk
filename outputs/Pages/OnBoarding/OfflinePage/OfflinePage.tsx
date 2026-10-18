import React from 'react';
import OfflineIllustration from '@illustrations/Offline.svg';
import { MetadataBar } from '@components/Layout/MetadataBar/MetadataBar';
import { useOrientation } from '../../useOrientation';
import { onboardingTokenStyles } from '../onboardingTokenStyles';
import { useElectronWindowMode } from '../../electronWindowMode';
import './OfflinePage.css';

export function OfflinePage() {
useElectronWindowMode('onboarding');
const orientation = useOrientation();

return (
  <div className={`offline-page offline-page--${orientation}`} data-theme="light" style={onboardingTokenStyles}>
    <main className="offline-page__main" aria-labelledby="offline-page-title">
      <div className="offline-page__message">
        { /* icon */ <OfflineIllustration aria-hidden="true" className="offline-page__illustration"/> }

        <div className="offline-page__copy">
          <h1 id="offline-page-title">Sem conexão de rede</h1>
          <p>
            Para baixar os dados do cliente e iniciar o provisionamento do terminal, é necessário acesso à internet. Verifique o cabo Ethernet ou conecte-se à rede Wi-Fi local.
          </p>
        </div>
      </div>
    </main>

    { /* footer */ <MetadataBar version="V 1.0.0.1"/> }
  </div>
);
}
