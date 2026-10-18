import React from 'react';
import { Tag } from '../Tag';
import './Legend.css';

export interface LegendProps {
  /**
   * The indicator element, such as a Badge or Tag.
   * @default <Tag status="Brand" text="Tipo" />
   */
  indicatorElement?: React.ReactNode;
  /**
   * The text description displayed next to the indicator.
   */
  description: string;
  /**
   * The size variant of the text.
   */
  textSize?: 'Body' | 'Body-sm';
}

export const Legend: React.FC<LegendProps> = ({
  indicatorElement = <Tag status="Brand" text="Tipo" />,
  description,
  textSize = 'Body-sm',
}) => {
  return (
    <div className="legend">
      {indicatorElement}
      <span className="legend-description" data-text-size={textSize}>{description}</span>
    </div>
  );
};
