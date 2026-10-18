import React from 'react';
import { LanguageSelection } from '../../Common/LanguageSelection';
import { Card_Option } from '../../Common/Card_Option';
import { TapIndicator } from '../../Common/TapIndicator';
import { normalizeLocale, useI18n, type AppLocale } from '../../../i18n';

import comprarIngressosImg from '@project-images/Comprar Ingressos.png';
import comprarBomboniereImg from '@project-images/Comprar na Bomboniere.png';
import retirarPedidoImg from '@project-images/Retirar Pedido Online.png';

import './WelcomeFooter.css';

const SYSTEM_LOCALES = [
{ locale: 'pt-BR', labelKey: 'language.portuguese' },
{ locale: 'es-419', labelKey: 'language.spanish' },
{ locale: 'en-US', labelKey: 'language.english' }
] as const;

export interface WelcomeFooterProps {
className?: string;
showActions?: boolean;
defaultLocale?: string;
onPickupOrder?: () => void;
onRevealActions?: () => void;
}

export const WelcomeFooter: React.FC<WelcomeFooterProps> = ({
className = '',
showActions = true,
defaultLocale = 'pt-BR',
onPickupOrder,
onRevealActions,
}) => {
const wrapperClass = `welcome-footer ${!showActions ? 'welcome-footer--languages-mode' : ''} ${className}`.trim();

const { locale: selectedLocale, setCustomerLocale, t } = useI18n();

const handleLocaleSelect = (loc: string) => {
  void setCustomerLocale(loc as AppLocale);
};

const defaultLocaleObj = SYSTEM_LOCALES.find(
  item => item.locale === normalizeLocale(defaultLocale)
) || SYSTEM_LOCALES[0];

const remainingLocales = SYSTEM_LOCALES.filter(
  item => item.locale !== defaultLocaleObj.locale
);

const orderedLocales = [defaultLocaleObj, ...remainingLocales];

return (
  <div className={wrapperClass}>
    {!showActions ? (
      <>
        <div className="welcome-footer__touch-region" onClick={onRevealActions}>
          <TapIndicator label={t('welcome.touchScreen')}/>
        </div>
        <div className="welcome-footer__languages">
          {orderedLocales.map((item) => (
            <LanguageSelection 
              isSelected={selectedLocale === item.locale} 
              key={item.locale} 
              label={t(item.labelKey)} 
              locale={item.locale} 
              onClick={() => handleLocaleSelect(item.locale)}
            />
          ))}
        </div>
      </>
    ) : (
      <div className="welcome-footer__actions">
        <Card_Option imageUrl={comprarIngressosImg} text={t('welcome.buyTickets')}/>
        <Card_Option imageUrl={comprarBomboniereImg} text={t('welcome.buyConcessions')}/>
        <Card_Option imageUrl={retirarPedidoImg} text={t('welcome.pickupOrder')} onClick={onPickupOrder}/>
      </div>
    )}
  </div>
);
};
