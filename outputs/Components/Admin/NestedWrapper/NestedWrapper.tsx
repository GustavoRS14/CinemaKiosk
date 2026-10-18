import React from 'react';
import './NestedWrapper.css';

export interface NestedWrapperProps {
  /**
   * The title text
   */
  title?: string;
  /**
   * Whether to show the title
   */
  showTitle?: boolean;
  /**
   * The list content as an array of items
   */
  list?: string[];
  /**
   * Additional class name for custom styling
   */
  className?: string;
}

export const NestedWrapper: React.FC<NestedWrapperProps> = ({
  title = 'Título',
  showTitle = true,
  list = ['Lista item 1', 'Lista item 2'],
  className = '',
}) => {
  return (
    <div className={`nested-wrapper ${className}`.trim()}>
      {showTitle && (
        <div className="nested-wrapper__title-container">
          <p className="nested-wrapper__title">{title}</p>
        </div>
      )}
      <div className="nested-wrapper__list-container">
        <div className="nested-wrapper__list-content">
          <ul className="nested-wrapper__list">
            {list.map((item, index) => (
              <li key={index} className="nested-wrapper__list-item">
                <span className="nested-wrapper__list-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
