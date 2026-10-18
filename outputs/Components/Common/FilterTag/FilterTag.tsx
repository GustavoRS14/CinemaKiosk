import React from 'react';
import './FilterTag.css';
import CloseIcon from '@icons/close.svg';

export type FilterTagProps = {
  className?: string;
  /** The text displayed in the tag */
  label?: string;
  /** Optional close handler */
  onClose?: () => void;
};

export function FilterTag({
  className = '',
  label = 'Texto',
  onClose,
}: FilterTagProps) {
  return (
    <button 
      className={`filter-tag ${className}`.trim()}
      onClick={onClose}
      aria-label={`Remover filtro ${label}`}
    >
      <p className="filter-tag__text">{label}</p>
      <div className="filter-tag__close">
        <CloseIcon />
      </div>
    </button>
  );
}

FilterTag.displayName = 'FilterTag';
