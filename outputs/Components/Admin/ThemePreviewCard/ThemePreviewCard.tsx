import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Divider } from '../../Common/Divider';
import { Button } from '../../Common/Button';
import './ThemePreviewCard.css';
import { useI18n } from '../../../i18n';

export type ThemePreviewCardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  /** Optional theme icon displayed before the title. */
  icon?: ReactNode;
};

export const ThemePreviewCard = forwardRef<HTMLDivElement, ThemePreviewCardProps>(
  function ThemePreviewCard(
    { className, title, description = 'Descrição', icon, ...nativeProps },
    ref
  ) {
    const { t } = useI18n();
    const resolvedTitle = title ?? t('admin.theme.light');
    return (
      <div
        {...nativeProps}
        ref={ref}
        className={`totem-theme-preview-card ${className || ''}`.trim()}
      >
        <div className="totem-theme-preview-card__title-row">
          {icon && <span className="totem-theme-preview-card__icon" aria-hidden="true">{icon}</span>}
          <p className="totem-theme-preview-card__title">{resolvedTitle}</p>
        </div>

        <Divider className="totem-theme-preview-card__divider"/>
        
        <div className="totem-theme-preview-card__content">
          <div className="totem-theme-preview-card__example">
            <p className="totem-theme-preview-card__example-heading">{t('admin.theme.exampleText')}</p>
            <p className="totem-theme-preview-card__example-description">{description}</p>
          </div>
          
          <Button 
            className="totem-theme-preview-card__button" 
            label={t('admin.theme.button')} 
            radius="2xs" 
            showLeftIcon={false} 
            showRightIcon={false} 
            showSecondaryLabel={false} 
          />
        </div>
      </div>
    );
  }
);

ThemePreviewCard.displayName = 'ThemePreviewCard';
