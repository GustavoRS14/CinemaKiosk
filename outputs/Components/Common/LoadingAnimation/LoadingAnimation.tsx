import type { CSSProperties, HTMLAttributes } from 'react';
import PopcornLoadingIllustration from '@illustrations/PopcornLoading.svg';
import './LoadingAnimation.css';

export interface LoadingAnimationProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Width of the loading illustration.
   * Can be a number in pixels or a valid CSS dimension string.
   * @default 240
   */
  size?: number | string;

  /**
   * Optional custom CSS class name.
   */
  className?: string;

  /**
   * Custom inline styles.
   */
  style?: CSSProperties;

  /**
   * Accessible description for assistive technologies.
   * @default 'Carregando...'
   */
  'aria-label'?: string;
}

type LoadingAnimationStyle = CSSProperties & {
  '--loading-animation-size'?: string;
};

export function LoadingAnimation({
  size = 240,
  className = '',
  style,
  'aria-label': ariaLabel = 'Carregando...',
  ...restProps
}: LoadingAnimationProps) {
  const resolvedSize = typeof size === 'number' ? `${size}px` : size;

  const combinedStyles: LoadingAnimationStyle = {
    '--loading-animation-size': resolvedSize,
    ...style,
  };

  const classes = ['loading-animation', className].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      style={combinedStyles}
      role="status"
      aria-label={ariaLabel}
      {...restProps}
    >
      <PopcornLoadingIllustration aria-hidden="true" focusable="false" />
    </span>
  );
}

export default LoadingAnimation;
