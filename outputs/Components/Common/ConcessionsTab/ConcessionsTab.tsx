import React from 'react';
import './ConcessionsTab.css';

export type ConcessionsTabProps = {
  className?: string;
  category?: string;
  imageUrl?: string;
  selected?: boolean;
  onClick?: () => void;
};

export const ConcessionsTab = ({
  className = '',
  category = 'Categoria',
  imageUrl,
  selected = false,
  onClick,
}: ConcessionsTabProps) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={`concessions-tab ${className}`}
      data-selected={selected.toString()}
      onClick={handleClick}
    >
      <div className="concessions-tab-image-container">
        {imageUrl ? (
          <img alt={category} className="concessions-tab-image" src={imageUrl} />
        ) : (
          <div className="concessions-tab-image-placeholder" />
        )}
      </div>
      <div className="concessions-tab-category">
        <p>{category}</p>
      </div>
    </div>
  );
};
