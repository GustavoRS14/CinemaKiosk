import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  /** Optional custom class */
  className?: string;
  /** The shape of the skeleton */
  variant?: 'rectangular' | 'circular' | 'text';
  /** Width of the skeleton (e.g., '100%', '48px', 120) */
  width?: string | number;
  /** Height of the skeleton (e.g., '100%', '48px', 20) */
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  // Convert numeric values to px safely
  const formattedWidth = typeof width === 'number' ? `${width}px` : width;
  const formattedHeight = typeof height === 'number' ? `${height}px` : height;

  const style: React.CSSProperties = {
    width: formattedWidth,
    height: formattedHeight,
  };

  return (
    <div
      className={`skeleton-component skeleton-component--${variant} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
};
