import React from 'react';
import './Card_Option.css';

export type Card_OptionProps = {
  className?: string;
  state?: 'Default' | 'Pressed';
  text?: string;
  imageUrl?: string;
  onClick?: () => void;
};

export const Card_Option = ({
  className = '',
  state = 'Default',
  text = 'Texto',
  imageUrl,
  onClick,
}: Card_OptionProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`card-option card-option-container ${className}`.trim()}
      data-state={state}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick();
        }
      }}
    >
      {imageUrl && (
        <div className="card-option-image-wrapper">
          <img alt="" className="card-option-image" src={imageUrl} />
        </div>
      )}
      <div className="card-option-text">
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Card_Option;
