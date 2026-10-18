import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

const DefaultCloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="currentColor"/>
  </svg>
);

import './CloseButton.css';

export type CloseButtonState = 'Default' | 'Pressed' | 'Disabled';
export type CloseButtonType = 'Contained' | 'Ghost';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'color' | 'disabled' | 'type'
>;

export type CloseButtonProps = NativeButtonProps & {
  /** Map to the Figma State property. */
  state?: CloseButtonState;
  /** Map to the Figma Type property. */
  type?: CloseButtonType;
  /**
   * Slot for icon instance swap.
   * Matches the Figma structure where the Close icon is nested as an instance.
   */
  icon?: ReactNode;
  /** Native button type, separated from Figma's Type property. */
  htmlType?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(function CloseButton(
  {
    icon,
    state = 'Default',
    type = 'Contained',
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
  
  const visualState: CloseButtonState = isDisabled 
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
      className={`totem-close-button ${className || ''}`.trim()}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      data-state={visualState}
      data-type={type}
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
      <span aria-hidden="true" className="totem-close-button__icon">
        {icon ?? <DefaultCloseIcon />}
      </span>
    </button>
  );
});

CloseButton.displayName = 'CloseButton';
