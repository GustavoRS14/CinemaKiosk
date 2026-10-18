import React, { useState, useEffect } from 'react';
import './SelectionCard.css';
import { RadioButton } from '../RadioButton';
import { Tag, type TagProps } from '../Tag';
import { MoviePoster } from '../MoviePoster';

export type SelectionCardProps = {
  className?: string;
  defaultSelected?: boolean;
  selected?: boolean;
  state?: 'Default' | 'Disabled' | 'Read Only';
  textSize?: 'lg' | 'sm';
  textWeight?: 'Medium' | 'Semibold' | 'Bold';
  title?: string;
  supportingText?: string;
  showTag?: boolean;
  showMoviePoster?: boolean;
  moviePosterImageUrl?: string;
  moviePosterTitle?: string;
  tagText?: string;
  tagStatus?: TagProps['status'];
  onClick?: () => void;
};

export const SelectionCard = ({
  className = '',
  defaultSelected = false,
  selected,
  state = 'Default',
  textSize = 'lg',
  textWeight = 'Semibold',
  title = 'Título',
  supportingText = 'Texto de suporte',
  showTag = false,
  showMoviePoster = false,
  moviePosterImageUrl = '',
  moviePosterTitle = title,
  tagText = 'Texto',
  tagStatus = 'Information',
  onClick,
}: SelectionCardProps) => {
  const [internalSelected, setInternalSelected] = useState(selected ?? defaultSelected);

  useEffect(() => {
    if (selected !== undefined) {
      setInternalSelected(selected);
    }
  }, [selected]);

  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read Only';

  const handleClick = () => {
    if (isDisabled || isReadOnly) return;
    if (selected === undefined) {
      setInternalSelected(!internalSelected);
    }
    if (onClick) onClick();
  };

  return (
    <div
      className={`selection-card ${className}`.trim()}
      data-state={state}
      data-selected={internalSelected.toString()}
      onClick={handleClick}
      aria-disabled={isDisabled}
      aria-readonly={isReadOnly}
    >
      <div className="selection-card-master">
        {showMoviePoster && moviePosterImageUrl && (
          <MoviePoster
            className="selection-card-movie-poster"
            imageUrl={moviePosterImageUrl}
            movieTitle={moviePosterTitle}
          />
        )}
        <div className="selection-card-text">
          <div className="selection-card-title-group">
            <p 
              className="selection-card-title" 
              data-text-size={textSize} 
              data-text-weight={textWeight}
            >
              {title}
            </p>
            {showTag && (
              <div className="selection-card-tag-wrapper">
                <Tag text={tagText} state={state} status={tagStatus} />
              </div>
            )}
          </div>
          <p className="selection-card-support-text">{supportingText}</p>
        </div>
        <RadioButton
          selected={internalSelected}
          state={state}
          className="selection-card-radio"
        />
      </div>
    </div>
  );
};
