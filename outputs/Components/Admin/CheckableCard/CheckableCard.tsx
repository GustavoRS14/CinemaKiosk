import React, { useState, useEffect } from 'react';
import './CheckableCard.css';
import { SelectionIndicator } from '../../Common/SelectionIndicator';
import { Divider } from '../../Common/Divider';
import { Tag, TagProps } from '../../Common/Tag';

export type CheckableCardState = 'Default' | 'Disabled' | 'Read Only';

export type CheckableCardProps = {
  className?: string;
  title?: string;
  description?: string;
  bottomText?: string;
  tagProps?: TagProps;
  selected?: boolean;
  state?: CheckableCardState;
  onClick?: () => void;
  selectionMode?: 'toggle' | 'radio';
};

export const CheckableCard = ({
  className = '',
  title = 'Título',
  description = 'Descrição',
  bottomText = 'Texto Inferior',
  tagProps = { text: 'Status', status: 'Neutral', state: 'Default' },
  selected = false,
  state = 'Default',
  onClick,
  selectionMode = 'toggle',
}: CheckableCardProps) => {
  const [internalSelected, setInternalSelected] = useState(selected);
  const isBlocked = state === 'Disabled' || state === 'Read Only';

  useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  const handleClick = () => {
    if (isBlocked) return;
    if (selectionMode === 'radio' && internalSelected) return;
    setInternalSelected(!internalSelected);
    if (onClick) onClick();
  };

  const getSelectionIndicatorState = () => {
    return state;
  };

  const getTagState = () => {
    if (state === 'Disabled') return 'Disabled';
    if (state === 'Read Only') return 'Read Only';
    return tagProps.state || 'Default';
  };

  return (
    <div
      className={`checkable-card ${className}`}
      data-state={state}
      data-selected={internalSelected.toString()}
      onClick={isBlocked ? undefined : handleClick}
      aria-disabled={isBlocked}
      aria-readonly={state === 'Read Only'}
      role={selectionMode === 'radio' ? 'radio' : undefined}
      aria-checked={selectionMode === 'radio' ? internalSelected : undefined}
    >
      <div className="checkable-card-main-content">
        <div className="checkable-card-title-check">
          <p className="checkable-card-title">{title}</p>
          <SelectionIndicator
            selected={internalSelected}
            state={getSelectionIndicatorState()}
            controlled={selectionMode === 'radio'}
          />
        </div>
        <p className="checkable-card-description">{description}</p>
      </div>

      <Divider className="checkable-card-divider" type="Solid" vertical={false} state={state} />

      <div className="checkable-card-bottom-info">
        <p className="checkable-card-bottom-text">{bottomText}</p>
        <Tag 
          {...tagProps} 
          text={internalSelected ? 'Ativado' : 'Desativado'}
          state={getTagState()} 
          status={internalSelected ? 'Brand' : tagProps.status} 
        />
      </div>
    </div>
  );
};
