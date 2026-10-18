import React, { type InputHTMLAttributes, useState } from 'react';
import './Input.css';

import SettingsIcon from '@icons/settings.svg';
import WarningIcon from '@icons/warning.svg';
import { TextButton } from '../TextButton';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'title'> & {
  className?: string;
  showTitle?: boolean;
  title?: string;
  showSupportingText?: boolean;
  supportingText?: string;
  tag?: boolean;
  state?: 'Default' | 'Filled' | 'Disabled' | 'Invalid' | 'Read Only';
  status?: 'Default' | 'Pressed';
  showIconLeft?: boolean;
  iconLeft?: React.ReactNode;
  showIconRight?: boolean;
  iconRight?: React.ReactNode;
  onIconRightClick?: () => void;
  showBadge?: boolean;
  badgeText?: string;
  actionRight?: boolean;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onCtaClick?: () => void;
  border?: 'xs' | 'sm' | 'md' | 'lg';
  controlRole?: React.AriaRole;
  controlTabIndex?: number;
  onControlClick?: React.MouseEventHandler<HTMLDivElement>;
  onControlKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className = '',
    showTitle = false,
    title = 'Título',
    showSupportingText = false,
    supportingText = 'Texto de suporte',
    tag = false,
    state = 'Default',
    status = 'Default',
    showIconLeft = false,
    iconLeft = <SettingsIcon aria-hidden="true" />,
    showIconRight = false,
    iconRight = <SettingsIcon aria-hidden="true" />,
    onIconRightClick,
    showBadge = false,
    badgeText = 'Badge',
    actionRight = false,
    ctaLabel = 'CTA',
    ctaDisabled = false,
    onCtaClick,
    border = 'md',
    controlRole,
    controlTabIndex,
    onControlClick,
    onControlKeyDown,
    placeholder = 'Texto',
    value,
    defaultValue,
    onChange,
    onBlur,
    disabled,
    readOnly,
    tabIndex,
    ...nativeProps
  },
  ref
) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const currentValue = value ?? internalValue;

  const isBlocked = state === 'Disabled' || state === 'Read Only' || disabled || readOnly;

  // Determine active state dynamically based on user interaction if in Default/Filled
  // Only override to 'Filled' if it currently is 'Default' or not explicitly forced to Invalid/Read Only/Disabled
  let activeState = disabled || state === 'Disabled'
    ? 'Disabled'
    : readOnly || state === 'Read Only'
      ? 'Read Only'
      : state;
  if (state === 'Default' && currentValue) {
    activeState = 'Filled';
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`input-wrapper ${className}`.trim()} data-state={activeState}>
      <div className="input-header">
        {showTitle && (
          <p className="input-title">
            {title}
          </p>
        )}
        <div
          className="input-control"
          data-state={activeState}
          data-status={status}
          data-border={border}
          data-focused={isFocused ? 'true' : 'false'}
          data-has-value={String(currentValue).length > 0 ? 'true' : 'false'}
          data-interactive={isBlocked ? 'false' : 'true'}
          role={isBlocked ? undefined : controlRole}
          tabIndex={isBlocked ? undefined : controlTabIndex}
          onClick={isBlocked ? undefined : onControlClick}
          onKeyDown={isBlocked ? undefined : onControlKeyDown}
        >
          {showIconLeft && (
            <div className="input-icon-slot">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            className="input-field"
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isBlocked}
            readOnly={isBlocked}
            tabIndex={isBlocked ? -1 : tabIndex}
            aria-disabled={isBlocked ? true : undefined}
            aria-readonly={state === 'Read Only' || readOnly ? true : undefined}
            {...nativeProps}
          />
          {showBadge && (
            <div className="input-badge">
              {badgeText}
            </div>
          )}
          {showIconRight && (
            onIconRightClick ? (
              <button
                type="button"
                className="input-icon-slot input-icon-action right"
                aria-label="Alternar visibilidade"
                onClick={onIconRightClick}
              >
                {iconRight}
              </button>
            ) : (
              <div className="input-icon-slot right" aria-hidden="true">
                {iconRight}
              </div>
            )
          )}
          {actionRight && (
            <TextButton
              intent="Primary"
              size="sm"
              label={ctaLabel}
              disabled={isBlocked || ctaDisabled}
              onClick={onCtaClick}
              tabIndex={isBlocked || ctaDisabled ? -1 : 0}
            />
          )}
        </div>
      </div>

      {tag && (
        <div className="input-tag">
          Tag
        </div>
      )}

      {showSupportingText && (
        <div className="input-supporting-text-wrapper">
          {state === 'Invalid' && (
            <div className="input-supporting-icon">
              <WarningIcon aria-hidden="true" />
            </div>
          )}
          <p className="input-supporting-text">
            {supportingText}
          </p>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
