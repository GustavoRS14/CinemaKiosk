import React, { useState, useEffect } from 'react';
import './ModifierGroup.css';
import { RequirementTag } from '../RequirementTag';
import { OptionListItem, OptionListItemProps } from './OptionListItem';
import { Divider } from '../Divider';

export type ModifierGroupProps = {
  /** Additional class names. */
  className?: string;
  /** The title of the modifier group. */
  title?: string;
  /** The status of the requirement tag. */
  requirementStatus?: 'Incomplete' | 'Complete';
  /** The count required for the requirement tag. */
  requirementCount?: number;
  /** Controls whether the requirement indicator is rendered. */
  showRequirementTag?: boolean;
  /** The list of products/options to display. */
  items?: OptionListItemProps[];
  onQuantitiesChange?: (quantities: number[]) => void;
};

export const ModifierGroup: React.FC<ModifierGroupProps> = ({
  className = '',
  title = 'Categoria',
  requirementStatus = 'Incomplete',
  requirementCount,
  showRequirementTag = true,
  items = [],
  onQuantitiesChange,
}) => {
  // Initialize state with default values from items
  const [quantities, setQuantities] = useState<number[]>(() =>
    items.map(item => item.defaultValue || 0)
  );

  // Re-sync if items array changes
  const defaultsKey = items.map(item => item.defaultValue || 0).join('|');
  useEffect(() => {
    setQuantities(items.map(item => item.defaultValue || 0));
  }, [defaultsKey]);

  // Calculate total selected options globally
  const totalSelected = quantities.reduce((acc, curr) => acc + curr, 0);
  
  // Check if the requirement limit has been reached
  const isLimitReached = requirementCount !== undefined && requirementCount > 0 && totalSelected >= requirementCount;
  
  // Auto-complete status if limit is reached
  const currentStatus = isLimitReached ? 'Complete' : requirementStatus;

  const handleQuantityChange = (index: number, newValue: number) => {
    const currentQty = quantities[index] || 0;
    
    // CRITICAL GUARD: Reject the increment if the global limit is already reached
    if (newValue > currentQty && isLimitReached) {
      return;
    }

    const newQuantities = [...quantities];
    newQuantities[index] = newValue;
    setQuantities(newQuantities);
    onQuantitiesChange?.(newQuantities);
  };

  return (
    <div className={`modifier-group ${className}`.trim()}>
      <div className="modifier-group-header">
        <h5 className="modifier-group-title">{title}</h5>
        {showRequirementTag && (
          <RequirementTag
            status={currentStatus}
            count={requirementCount}
          />
        )}
      </div>

      {items.length > 0 && (
        <div className="modifier-group-products">
          {items.map((item, index) => {
            const currentQty = quantities[index] || 0;
            const isItemEmpty = currentQty === 0;
            
            // 1. Freeze the max value to its current quantity if the global limit is reached
            const itemMax = requirementCount !== undefined && requirementCount > 0 ? requirementCount : undefined;
            const computedMax = isLimitReached ? currentQty : ((item as any).max || itemMax);
            
            // 2. State routing: Empty items become 'Disabled', Active items become 'Maximum'
            const forceDisabled = isLimitReached && isItemEmpty;
            
            let computedState = (item as any).state || 'Default';
            if ((item as any).disabled || forceDisabled) {
              computedState = 'Disabled';
            } else if (isLimitReached && currentQty > 0) {
              computedState = 'Maximum';
            }

            return (
              <React.Fragment key={index}>
                {/* @ts-ignore: Dynamically injecting state management handlers and overrides */}
                <OptionListItem
                  {...item}
                  value={currentQty} // CRITICAL: Forces the component to be fully controlled
                  disabled={(item as any).disabled || forceDisabled}
                  state={computedState}
                  max={computedMax}
                  onChange={(val: number) => {
                    handleQuantityChange(index, val);
                    if ((item as any).onChange) (item as any).onChange(val);
                  }}
                />
                {index < items.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
