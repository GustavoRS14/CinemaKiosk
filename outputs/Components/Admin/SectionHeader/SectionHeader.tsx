import React from 'react';
import './SectionHeader.css';
import IconId from '@icons/ID.svg';
import { Divider } from '../../Common/Divider';

export interface SectionHeaderProps {
  /**
   * The title of the section.
   */
  title: string;
  /**
   * The icon displayed next to the title.
   * @default <IconId className="section-header-icon" aria-hidden="true" />
   */
  icon?: React.ReactNode;
  /**
   * Toggles the visibility of the entire actions container.
   */
  showActions?: boolean;
  /**
   * Toggles the visibility of the secondary action and its divider.
   */
  showSecondaryAction?: boolean;
  /**
   * The primary action rendered on the far right.
   */
  primaryAction?: React.ReactNode;
  /**
   * The secondary action rendered on the left of the primary action.
   * When provided and visible, a vertical Divider is automatically rendered next to it.
   */
  secondaryAction?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon = <IconId className="section-header-icon" aria-hidden="true" />,
  showActions = false,
  showSecondaryAction = false,
  primaryAction,
  secondaryAction,
}) => {
  const isSecondaryVisible = secondaryAction && showSecondaryAction;

  return (
    <header className="section-header">
      <div className="section-header-content">
        {icon && <span className="section-header-icon-wrapper">{icon}</span>}
        <h2 className="section-header-title">{title}</h2>
      </div>
      {showActions && (primaryAction || isSecondaryVisible) && (
        <div className="section-header-actions">
          {isSecondaryVisible && (
            <>
              {secondaryAction}
              <Divider vertical={true} />
            </>
          )}
          {primaryAction}
        </div>
      )}
    </header>
  );
};
