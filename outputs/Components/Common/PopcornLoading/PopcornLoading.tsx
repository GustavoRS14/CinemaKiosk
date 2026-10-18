import type { CSSProperties } from 'react';
import PopcornLoadingIllustration from '@illustrations/PopcornLoading.svg';
import './PopcornLoading.css';

export interface PopcornLoadingProps {
  /** Width and height of the loading illustration. */
  size?: number | string;
  /** Optional custom class name. */
  className?: string;
  /** Accessible status description. */
  'aria-label'?: string;
}

type PopcornLoadingStyle = CSSProperties & {
  '--popcorn-loading-size': string;
};

export function PopcornLoading({
  size = 240,
  className = '',
  'aria-label': ariaLabel = 'Carregando',
}: PopcornLoadingProps) {
  const resolvedSize = typeof size === 'number' ? `${size}px` : size;
  const classes = ['popcorn-loading', className].filter(Boolean).join(' ');
  const style: PopcornLoadingStyle = {
    '--popcorn-loading-size': resolvedSize,
  };

  return (
    <span className={classes} style={style} role="status" aria-label={ariaLabel}>
      <PopcornLoadingIllustration aria-hidden="true" focusable="false" />
    </span>
  );
}
