import React from 'react';
import { LocaleAvatar } from '../../Admin/LocaleAvatar';
import './LanguageSelection.css';

export interface LanguageSelectionProps {
  /* The ISO locale identifier (e.g., 'pt-BR', 'en-US') passed strictly to LocaleAvatar */
  locale: string;
  /* The display name of the language (e.g., 'Português') */
  label: string;
  /* Whether this language is currently selected */
  isSelected?: boolean;
  /* Optional click handler */
  onClick?: () => void;
  className?: string;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({
  locale,
  label,
  isSelected = false,
  onClick,
  className = '',
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const wrapperClass = `language-selection ${isSelected ? 'language-selection--selected' : ''} ${className}`.trim();

  return (
    <div className={wrapperClass} onClick={handleClick}>
      <div className="language-selection__avatar-wrapper">
        <LocaleAvatar locale={locale}/>
      </div>
      <div className="language-selection__label">
        {label}
      </div>
    </div>
  );
};
