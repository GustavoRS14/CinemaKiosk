import React from 'react';

const AccessibilityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12.002 4.99999C12.9685 4.99999 13.752 4.21649 13.752 3.24999C13.752 2.2835 12.9685 1.5 12.002 1.5C11.0356 1.5 10.2521 2.2835 10.2521 3.24999C10.2521 4.21649 11.0356 4.99999 12.002 4.99999Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9.73712 12.8068C9.86399 12.0166 9.92087 11.2528 9.71524 10.7247C9.54024 10.2706 9.15962 10.0164 8.70024 9.84315L4.65207 8.53328C4.12707 8.35828 3.63663 8.06516 3.60207 7.48591C3.55832 6.74216 4.21457 6.26091 4.87082 6.43591C4.87082 6.43591 8.72081 7.79828 12.002 7.79828C15.2833 7.79828 19.0895 6.44204 19.0895 6.44204C19.877 6.22329 20.402 6.83579 20.402 7.48285C20.402 8.10453 19.9208 8.32328 19.352 8.53022L15.502 9.92628C15.152 10.0575 14.5833 10.32 14.3645 10.7216C14.102 11.192 14.1458 12.0136 14.2727 12.8037L14.5308 14.1L16.1675 21.2706C16.29 21.8459 15.8918 22.3836 15.3187 22.4842C14.7456 22.5849 14.277 22.1937 14.1073 21.6372L12.464 16.5653C12.385 16.3221 12.315 16.0761 12.254 15.8273L12.002 14.8L11.7702 15.7472C11.6967 16.0491 11.6121 16.3477 11.5164 16.6432L9.90205 21.6329C9.72705 22.1951 9.26768 22.5844 8.69456 22.4842C8.12143 22.3841 7.71456 21.8022 7.84318 21.2706L9.47899 14.1031L9.73712 12.8068Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
import { Button } from '../../Common/Button';
import SignOutIcon from '@icons/sign-out.svg';
import { useI18n } from '../../../i18n';
import './Footer.css';

export type FooterProps = {
  context?: 'Customer' | 'Admin';
  actionLeft?: boolean;
  price?: string;
  showCenterAction?: boolean;
  showMainCta?: boolean;
  mainCtaDisabled?: boolean;
  showPrice?: boolean;
  showTotalPrice?: boolean;
  mainCtaLabel?: string;
  onBack?: () => void;
  onMainAction?: () => void;
  onExit?: () => void;
  onAccessibility?: () => void;
};

export function Footer({
  context = 'Customer',
  actionLeft = true,
  price = '0,00',
  showCenterAction = true,
  showMainCta = true,
  mainCtaDisabled = false,
  showPrice = true,
  showTotalPrice = true,
  mainCtaLabel,
  onBack,
  onMainAction,
  onExit,
  onAccessibility,
}: FooterProps) {
  const { t } = useI18n();
  const resolvedMainCtaLabel = mainCtaLabel ?? t('action.next');
  if (context === 'Admin') {
    return (
      <footer className="footer footer--admin">
        <Button
          className="footer__button"
          intent="information"
          variant="ghost"
          radius="lg"
          label={t('navigation.accessibility')}
          showSecondaryLabel={false}
          showLeftIcon={false}
          showRightIcon
          rightIcon={<AccessibilityIcon />}
          onClick={onAccessibility}
        />
        <Button
          className="footer__button"
          intent="neutral"
          variant="ghost"
          radius="lg"
          label={t('navigation.exitPanel')}
          showSecondaryLabel={false}
          showLeftIcon={false}
          showRightIcon
          rightIcon={<SignOutIcon />}
          onClick={onExit}
        />
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer__left">
        {actionLeft && (
          <Button
            className="footer__button"
            intent="primary"
            variant="ghost"
            radius="lg"
            label={t('action.back')}
            showSecondaryLabel={false}
            showLeftIcon={false}
            showRightIcon={false}
            onClick={onBack}
          />
        )}
      </div>

      {showCenterAction && (
        <Button
          className="footer__button"
          intent="information"
          variant="ghost"
          radius="lg"
          label={t('navigation.accessibility')}
          showSecondaryLabel={false}
          showLeftIcon={false}
          showRightIcon
          rightIcon={<AccessibilityIcon />}
          onClick={onAccessibility}
        />
      )}

      <div className="footer__right">
        {showPrice && showTotalPrice && (
          <div className="footer__total">
            <span className="footer__total-label">{t('common.total')}</span>
            <span className="footer__price"><span>R$</span><span>{price}</span></span>
          </div>
        )}

        {showMainCta && (
          <Button
            className="footer__button"
            intent="primary"
            variant="solid"
            radius="lg"
            label={resolvedMainCtaLabel}
            showSecondaryLabel={false}
            showLeftIcon={false}
            showRightIcon={false}
            onClick={onMainAction}
            disabled={mainCtaDisabled}
          />
        )}
      </div>
    </footer>
  );
}

Footer.displayName = 'Footer';
