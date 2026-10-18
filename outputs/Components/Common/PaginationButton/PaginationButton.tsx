import React from 'react';
import './PaginationButton.css';
import ChevronRight from '@icons/chevron-right.svg';
import { useI18n } from '../../../i18n';

export interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The direction the chevron should point.
   * @default 'right'
   */
  direction?: 'left' | 'right';
}

export const PaginationButton: React.FC<PaginationButtonProps> = ({ 
  disabled, 
  direction = 'right',
  ...props 
}) => {
  const { t } = useI18n();
  return (
    <button 
      className="pagination-button" 
      disabled={disabled}
      data-direction={direction}
      aria-label={props['aria-label'] || t(direction === 'left' ? 'common.previous' : 'common.next')}
      {...props}
    >
      <ChevronRight />
    </button>
  );
};
