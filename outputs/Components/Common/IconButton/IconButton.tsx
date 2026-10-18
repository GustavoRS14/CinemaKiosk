import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import DefaultAddPlusIcon from '@icons/add-plus.svg';
import './IconButton.css';

export type IconButtonState = 'Default' | 'Pressed' | 'Disabled';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'color' | 'disabled' | 'type'
>;

export type IconButtonProps = NativeButtonProps & {
  /** Map to the Figma State property. */
  state?: IconButtonState;
  /**
   * Slot for icon instance swap.
   * Matches the Figma structure where the icon is nested as an instance.
   */
  icon?: ReactNode;
  /** Native button type. */
  htmlType?: 'button' | 'submit' | 'reset';
  /** Native disabled state. */
  disabled?: boolean;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    state = 'Default',
    htmlType = 'button',
    disabled,
    className,
    style,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
    onKeyDown,
    onKeyUp,
    ...nativeProps
  },
  ref,
) {
  const [interactionPressed, setInteractionPressed] = useState(false);
  const isDisabled = disabled || state === 'Disabled';
  
  const visualState: IconButtonState = isDisabled 
    ? 'Disabled' 
    : state === 'Pressed' || interactionPressed 
      ? 'Pressed' 
      : 'Default';

  const pressFromKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isDisabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setInteractionPressed(true);
    }
  };

  return (
    <button
      {...nativeProps}
      ref={ref}
      type={htmlType}
      className={`totem-icon-button ${className || ''}`.trim()}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      data-state={visualState}
      style={style}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        if (!isDisabled) setInteractionPressed(true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event: PointerEvent<HTMLButtonElement>) => {
        setInteractionPressed(false);
        onPointerUp?.(event);
      }}
      onPointerCancel={(event: PointerEvent<HTMLButtonElement>) => {
        setInteractionPressed(false);
        onPointerCancel?.(event);
      }}
      onPointerLeave={(event: PointerEvent<HTMLButtonElement>) => {
        setInteractionPressed(false);
        onPointerLeave?.(event);
      }}
      onKeyDown={(event) => {
        pressFromKey(event);
        onKeyDown?.(event);
      }}
      onKeyUp={(event) => {
        setInteractionPressed(false);
        onKeyUp?.(event);
      }}
    >
      <span aria-hidden="true" className="totem-icon-button__icon">
        {icon ?? <DefaultAddPlusIcon />}
      </span>
    </button>
  );
});

IconButton.displayName = 'IconButton';
