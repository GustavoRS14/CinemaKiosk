import React from 'react';
import './RatingAge.css';

export type RatingAgeVariant =
  | 'L' | '6' | '10' | '12' | '14' | '16' | '18'
  | 'AL' | 'A6' | 'A10' | 'A12' | 'A14' | 'A16' | 'A18' | '?';

export type RatingAgeBorderType = 'Fixed White' | 'Theme Adaptive';

export interface RatingAgeProps {
  /**
   * The rating age variant to be displayed.
   */
  rating: RatingAgeVariant;
  /**
   * The border type style variant.
   */
  borderType?: RatingAgeBorderType;
}

const colorMap: Record<RatingAgeVariant, string> = {
  'AL': 'green',
  'L': 'green',
  'A6': 'pink',
  '6': 'pink',
  'A10': 'blue',
  '10': 'blue',
  'A12': 'yellow',
  '12': 'yellow',
  'A14': 'orange',
  '14': 'orange',
  'A16': 'red',
  '16': 'red',
  'A18': 'black',
  '18': 'black',
  '?': 'grey',
};

export const RatingAge: React.FC<RatingAgeProps> = ({ rating, borderType = 'Fixed White' }) => {
  const colorClass = `rating-age--${colorMap[rating]}`;

  return (
    <div className={`rating-age ${colorClass}`} data-border-type={borderType}>
      <span className="rating-age__value">{rating}</span>
    </div>
  );
};
