import React from 'react';
import './NestedSelectionGroup.css';
import { Choice_Chip } from '../../Common/Choice_Chip'; // Maintain original relative path

export type NestedSelectionGroupProps = {
  className?: string;
  groupTitle?: string;
  state?: 'Default' | 'Read Only' | 'Disabled';
  children?: React.ReactNode;
};

export const NestedSelectionGroup = ({
  className = '',
  groupTitle = 'Título do grupo',
  state = 'Default',
  children,
}: NestedSelectionGroupProps) => {
  return (
    <div className={`nested-selection-group ${className}`.trim()} data-state={state}>
      <div className="nested-selection-group-title-wrapper">
        <p className="nested-selection-group-title">{groupTitle}</p>
      </div>
      <div className="nested-selection-group-chips">
        {children || (
          <>
            <Choice_Chip selected={false} state={state} />
            <Choice_Chip selected={false} state={state} />
            <Choice_Chip selected={false} state={state} />
            <Choice_Chip selected={false} state={state} />
            <Choice_Chip selected={false} state={state} />
            <Choice_Chip selected={false} state={state} />
            <Choice_Chip selected={false} state={state} />
            <Choice_Chip selected={false} state={state} />
          </>
        )}
      </div>
    </div>
  );
};
