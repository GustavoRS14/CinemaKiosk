import React, { useState } from 'react';
import './SettingsGroup.css';
import { CheckableCard } from '../../Admin/CheckableCard';

export type SettingsGroupProps = {
  className?: string;
  settingsTitle?: string;
  settingsDescription?: string;
};

export const SettingsGroup = ({
  className = '',
  settingsTitle = 'Título da configuração',
  settingsDescription = 'Descrição da configuração',
}: SettingsGroupProps) => {
  // Independent states to allow simultaneous selections
  const [isCard1Selected, setIsCard1Selected] = useState<boolean>(true);
  const [isCard2Selected, setIsCard2Selected] = useState<boolean>(false);

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
          }}
          onClick={() => setIsCard1Selected(!isCard1Selected)}
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
          }}
          onClick={() => setIsCard2Selected(!isCard2Selected)}
        />
      </div>
    </div>
  );
};
