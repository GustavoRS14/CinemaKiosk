import React from 'react';
import './ExperienceContainer.css';

export interface ExperienceContainerProps {
  /** The format of the experience container */
  format?: 'Premium' | '3D';
  /** Optional class name for the outer wrapper */
  className?: string;
  /** The badges to display inside the container (e.g., ExperienceBadge) */
  children?: React.ReactNode;
}

export const ExperienceContainer: React.FC<ExperienceContainerProps> = ({
  format = 'Premium',
  className = '',
  children,
}) => {
  return (
    <div 
      className={`experience-container ${className}`.trim()} 
      data-format={format}
    >
      {children}
    </div>
  );
};
