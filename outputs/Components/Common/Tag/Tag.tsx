import React from 'react';
import './Tag.css';

export type TagProps = {
  className?: string;
  status?: 'Brand' | 'Information' | 'Warning' | 'Success' | 'Error' | 'Neutral';
  state?: 'Default' | 'Disabled' | 'Read Only';
  text?: string;
};

export const Tag = ({
  className = '',
  status = 'Neutral',
  state = 'Default',
  text = 'Tag',
}: TagProps) => {
  const isBlocked = state === 'Disabled' || state === 'Read Only';

  return (
    <div
      className={`tag tag-container ${className}`.trim()}
      data-status={status}
      data-state={state}
      aria-disabled={state === 'Disabled' ? true : undefined}
      aria-readonly={state === 'Read Only' ? true : undefined}
    >
      <div className="tag-text">
        <p>{text}</p>
      </div>
    </div>
  );
};
