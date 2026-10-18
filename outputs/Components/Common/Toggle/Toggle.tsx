import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToggleState = 'default' | 'pressed' | 'disabled';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'color' | 'disabled' | 'type' | 'role' | 'aria-checked'
>;

export type ToggleProps = NativeButtonProps & {
  /**
   * The default active state when uncontrolled.
   */
  defaultActive?: boolean;
  /**
   * Whether the toggle is in the "on" (active) state.
   * When provided the component runs in CONTROLLED mode.
   * Omit (or pass undefined) for UNCONTROLLED mode — the component
   * manages its own internal state and flips automatically on click.
   */
  isActive?: boolean;
  /**
   * Callback fired after a click or Space/Enter key-up.
   * Receives the NEXT boolean value the component wants to move to.
   * In controlled mode the parent must update isActive in response.
   */
  onActiveChange?: (next: boolean) => void;
  /**
   * Exposes Figma static visual states for deterministic testing.
   * 'pressed' renders the held-down visual without affecting isActive logic.
   */
  state?: ToggleState;
  /** Mirrors the native disabled attribute. */
  disabled?: boolean;
  /** Native button type. */
  htmlType?: 'button' | 'submit' | 'reset';
};

import './Toggle.css';

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    defaultActive = false,
    isActive: isActiveProp,
    onActiveChange,
    state = 'default',
    disabled = false,
    htmlType = 'button',
    className = '',
    style,
    onClick,
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
  const isControlled = isActiveProp !== undefined;
  const [internalActive, setInternalActive] = useState(defaultActive);
  const isActive = isControlled ? isActiveProp : internalActive;

  const [interactionPressed, setInteractionPressed] = useState(false);

  const isDisabled = disabled || state === 'disabled';

  const visualState: ToggleState = isDisabled
    ? 'disabled'
    : state === 'pressed' || interactionPressed
    ? 'pressed'
    : 'default';

  const commitToggle = () => {
    if (isDisabled) return;
    const next = !isActive;
    if (!isControlled) setInternalActive(next);
    onActiveChange?.(next);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    commitToggle();
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isDisabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setInteractionPressed(true);
    }
    onKeyDown?.(event);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isDisabled && (event.key === 'Enter' || event.key === ' ')) {
      commitToggle();
    }
    setInteractionPressed(false);
    onKeyUp?.(event);
  };

  const finalClassName = `totem-toggle ${className}`.trim();

  return (
    <button
      {...nativeProps}
      ref={ref}
      type={htmlType}
      role="switch"
      aria-checked={isActive}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      className={finalClassName}
      style={style}
      data-state={visualState}
      data-active={isActive}
      onClick={handleClick}
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
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <span className="totem-toggle-thumb" aria-hidden="true" />
    </button>
  );
});

Toggle.displayName = 'Toggle';
