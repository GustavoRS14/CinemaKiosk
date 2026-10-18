import React, { useState } from 'react';
import './SettingsGroup.css';
import { CheckableCard } from '../CheckableCard';

export type SettingsGroupProps = {
  className?: string;
  settingsTitle?: string;
  settingsDescription?: string;
  state?: 'Default' | 'Disabled' | 'Read Only';
};

export const SettingsGroup = ({
  className = '',
  settingsTitle = 'Título da configuração',
  settingsDescription = 'Descrição da configuração',
  state = 'Default',
}: SettingsGroupProps) => {
  // Independent states so they don't behave like a mutually exclusive RadioButton
  const [isCard1Selected, setIsCard1Selected] = useState<boolean>(true);
  const [isCard2Selected, setIsCard2Selected] = useState<boolean>(false);

  const isBlocked = state === 'Disabled' || state === 'Read Only';

  return (
    <div className={`settings-group ${className}`.trim()}>
      <div className="settings-group-header">
        <p className="settings-group-title">{settingsTitle}</p>
        <p className="settings-group-description">{settingsDescription}</p>
      </div>
      <div className="settings-group-container">
        <CheckableCard
          className="settings-group-card"
          title="Título"
          description="Descrição"
          bottomText="Texto Inferior"
          selected={isCard1Selected}
          tagProps={{
            text: isCard1Selected ? 'Ativado' : 'Desativado',
            status: isCard1Selected ? 'Brand' : 'Neutral',
            state: state === 'Disabled' || state === 'Read Only' ? state : 'Default'
          }}
          state={state}
          onClick={() => {
            if (isBlocked) return;
            setIsCard1Selected(!isCard1Selected);
          }}
        />
        <CheckableCard
          className="settings-group-card"
          title="Título"
          description="Descrição"
          bottomText="Texto Inferior"
          selected={isCard2Selected}
          tagProps={{
            text: isCard2Selected ? 'Ativado' : 'Desativado',
            status: isCard2Selected ? 'Brand' : 'Neutral',
            state: state === 'Disabled' || state === 'Read Only' ? state : 'Default'
          }}
          state={state}
          onClick={() => {
            if (isBlocked) return;
            setIsCard2Selected(!isCard2Selected);
          }}
        />
      </div>
    </div>
  );
};
