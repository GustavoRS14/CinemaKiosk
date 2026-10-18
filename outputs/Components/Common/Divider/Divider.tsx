import React from 'react';
import './Divider.css';

export type DividerProps = {
  className?: string;
  type?: 'Solid' | 'Dashed';
  vertical?: boolean;
  state?: 'Default' | 'Disabled' | 'Read Only';
};

export const Divider = ({
  className = '',
  type = 'Solid',
  vertical = false,
  state = 'Default',
}: DividerProps) => {
  const orientationClass = vertical ? 'divider-vertical' : 'divider-horizontal';

  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      className={`divider divider-container ${orientationClass} ${className}`.trim()}
      data-type={type}
      data-state={state}
    />
  );
};
