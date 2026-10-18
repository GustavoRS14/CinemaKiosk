import React, { useState, useEffect } from 'react';
import './ListItemGroup.css';
import { Toggle } from '../Toggle';
import { SettingsGroup } from '../../Admin/SettingsGroup';
import { NestedSelectionGroup } from '../../Admin/NestedSelectionGroup';
import { Choice_Chip } from '../Choice_Chip';

export type ListItemGroupState = 'Default' | 'Disabled' | 'Read Only';

export type SubfeatureItem = {
  label: string;
  selected?: boolean;
};

export type SubfeatureGroupData = {
  groupTitle: string;
  items: SubfeatureItem[];
};

export type ListItemGroupProps = {
  className?: string;
  title?: string;
  showSuffix?: boolean;
  suffix?: string;
  showSecondaryTitle?: boolean;
  secondaryTitle?: string;
  showDescription?: boolean;
  description?: string;
  defaultSelected?: boolean;
  selected?: boolean;
  state?: ListItemGroupState;
  showSettingsGroup?: boolean;
  showSubfeatures?: boolean;
  subfeatures?: SubfeatureGroupData[];
  actionSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  onSelectedChange?: (selected: boolean) => void;
};

export const ListItemGroup = ({
  className = '',
  title = 'Título',
  showSuffix = false,
  suffix = 'Sufixo',
  showSecondaryTitle = false,
  secondaryTitle = 'Título Secundário',
  showDescription = false,
  description = 'Descrição',
  defaultSelected = false,
  selected,
  state = 'Default',
  showSettingsGroup = true,
  showSubfeatures = true,
  subfeatures = [],
  actionSlot,
  bottomSlot,
  onSelectedChange,
}: ListItemGroupProps) => {
  const [internalSelected, setInternalSelected] = useState(selected ?? defaultSelected);

  useEffect(() => {
    if (selected !== undefined) {
      setInternalSelected(selected);
    }
  }, [selected]);

  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read Only';
  const isBlocked = isDisabled || isReadOnly;

  const handleToggle = (next: boolean) => {
    if (isBlocked) return;
    setInternalSelected(next);
    if (onSelectedChange) onSelectedChange(next);
  };

  return (
    <div
      className={`list-item-group ${className}`}
      data-state={state}
      data-selected={internalSelected.toString()}
      aria-disabled={isDisabled}
      aria-readonly={isReadOnly}
    >
      <div className="list-item-group-base">
        <div className="list-item-master">
          <div className="list-item-master-text-slot">
            <div className="list-item-master-text">
              <div className="list-item-master-title">
                <p className="list-item-master-main-title">{title}</p>
                {showSuffix && (
                  <>
                    <span className="list-item-master-separator">|</span>
                    <p className="list-item-master-suffix">{suffix}</p>
                  </>
                )}
              </div>
              {showSecondaryTitle && (
                <p className="list-item-master-secondary-title">{secondaryTitle}</p>
              )}
              {showDescription && (
                <p className="list-item-master-description">{description}</p>
              )}
            </div>
            {bottomSlot && (
              <div className="list-item-master-bottom-slot-wrapper">
                {bottomSlot}
              </div>
            )}
          </div>
          <div className="list-item-master-toggle-wrapper">
            {actionSlot ? actionSlot : (
              <Toggle 
                isActive={internalSelected} 
                onActiveChange={handleToggle}
                state={isDisabled ? 'disabled' : isReadOnly ? 'read-only' : 'default'}
                disabled={isBlocked}
              />
            )}
          </div>
        </div>
        
        {internalSelected && (showSettingsGroup || (showSubfeatures && subfeatures.length > 0)) && (
          <div className="list-item-group-children">
            {showSettingsGroup && (
              <SettingsGroup state={state} />
            )}
            
            {showSubfeatures && subfeatures.map((group, idx) => (
              <NestedSelectionGroup 
                key={idx} 
                groupTitle={group.groupTitle}
                state={isReadOnly ? 'Read Only' : isDisabled ? 'Disabled' : 'Default'}
              >
                {group.items.map((item, i) => (
                  <Choice_Chip 
                    key={i} 
                    optionName={item.label} 
                    selected={item.selected ?? false}
                    state={isReadOnly ? 'Read Only' : isDisabled ? 'Disabled' : 'Default'}
                  />
                ))}
              </NestedSelectionGroup>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
