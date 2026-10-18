import React from 'react';
import './NestedSelectionGroup.css';

export type NestedSelectionGroupProps = {
  className?: string;
  groupTitle?: string;
  children?: React.ReactNode;
};

export const NestedSelectionGroup = ({
  className = '',
  groupTitle = 'Título do grupo',
  children,
}: NestedSelectionGroupProps) => {
  return (
    <div className={`nested-selection-group ${className}`}>
      <div className="nested-selection-group-title">
        <p>{groupTitle}</p>
      </div>
      {children && (
        <div className="nested-selection-group-container">
          {children}
        </div>
      )}
    </div>
  );
};
