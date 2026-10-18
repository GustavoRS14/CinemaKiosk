import React, { type ButtonHTMLAttributes } from 'react';
import './KeyKeyboard.css';

import DeleteIcon from '@icons/delete.svg';

export type KeyKeyboardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  icon?: boolean;
  intent?: 'Default' | 'Destructive';
  state?: 'Default' | 'Pressed' | 'Disabled';
  surface?: 'Tertiary' | 'Secondary';
  children?: React.ReactNode;
};

export const KeyKeyboard = React.forwardRef<HTMLButtonElement, KeyKeyboardProps>(
  function KeyKeyboard(
    {
      className = '',
      icon = false,
      intent = 'Default',
      state = 'Default',
      surface = 'Tertiary',
      children = '1',
      disabled,
      onClick,
      ...nativeProps
    },
    ref
  ) {
    const isDisabled = state === 'Disabled' || disabled;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <div className={`key-keyboard-wrapper ${className}`.trim()}>
        <button
          ref={ref}
          type="button"
          className="key-keyboard"
          data-intent={intent}
          data-state={state}
          data-surface={surface}
          disabled={isDisabled}
          aria-disabled={isDisabled ? true : undefined}
          onClick={handleClick}
          {...nativeProps}
        >
          {icon ? (
            <div className="key-keyboard-icon">
              <DeleteIcon aria-hidden="true" />
            </div>
          ) : (
            <span className="key-keyboard-text">{children}</span>
          )}
        </button>
      </div>
    );
  }
);

KeyKeyboard.displayName = 'KeyKeyboard';
