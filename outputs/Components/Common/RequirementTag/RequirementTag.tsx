import React from 'react';
import './RequirementTag.css';
import Check from '@icons/Check.svg';
import { useI18n } from '../../../i18n';

export interface RequirementTagProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'Incomplete' | 'Complete';
  count?: number;
}

export const RequirementTag: React.FC<RequirementTagProps> = ({ 
  status = 'Incomplete', 
  count, 
  className,
  ...props 
}) => {
  const { t } = useI18n();
  const dynamicLabel = t(count && count >= 2 ? 'customization.requiredPlural' : 'customization.required');
  return (
    <div className={`requirement-tag ${className || ''}`} {...props}>
      <div className={`requirement-tag-icon requirement-tag-icon--${status.toLowerCase()}`}>
        <Check />
      </div>
      <div className="requirement-tag-content">
        {count !== undefined && (
          <span className="requirement-tag-count">{count}</span>
        )}
        <span className="requirement-tag-label">{dynamicLabel}</span>
      </div>
    </div>
  );
};
