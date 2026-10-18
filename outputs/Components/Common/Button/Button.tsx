import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

export type ButtonState = 'default' | 'pressed' | 'disabled';
export type ButtonRadius = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonIntent = 'primary' | 'information' | 'neutral';
export type ButtonVariant = 'solid' | 'subtle' | 'ghost' | 'outlined';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'color' | 'disabled' | 'type'
>;

export type ButtonProps = NativeButtonProps & {
    /** Figma Intent property. Information and Neutral resolve to Ghost. */
    intent?: ButtonIntent;
    /** Figma Type property. */
    variant?: ButtonVariant;
    /** Maps the Figma Text property. */
    label?: ReactNode;
    /** Maps the Figma Secondary Text property. */
    secondaryLabel?: ReactNode;
    /** Maps the Figma Secondary Label boolean property. */
    showSecondaryLabel?: boolean;
    /** Maps the nested Figma Show Icon Left boolean property. */
    showLeftIcon?: boolean;
    /** Maps the nested Figma Icon Left instance-swap property. */
    leftIcon?: ReactNode;
    /** Maps the nested Figma Show Icon Right boolean property. */
    showRightIcon?: boolean;
    /** Maps the nested Figma Icon Right instance-swap property. */
    rightIcon?: ReactNode;
    /** Shows the circular counter used by filter actions. */
    showBadge?: boolean;
    /** Counter content displayed when showBadge is enabled. */
    badgeText?: ReactNode;
    /** Exposes the nested .ButtonBorderControl variants. Figma Button uses lg. */
    radius?: ButtonRadius;
    /** Exposes Figma's static visual states for deterministic testing. */
    state?: ButtonState;
    /** Native button type, separated from Figma's Type property. */
    htmlType?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
};

import './Button.css';
import PlusIcon from '@icons/add-plus.svg';

function DefaultPlusIcon() {
  return <img src={PlusIcon} alt="" aria-hidden="true" className="totem-button-plus-icon" />;
}

function IconSlot({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="totem-button-icon-slot">
      {children}
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    label = 'Label',
    secondaryLabel = 'Secondary Label',
    showSecondaryLabel = true,
    showLeftIcon = true,
    leftIcon,
    showRightIcon = true,
    rightIcon,
    showBadge = false,
    badgeText = '0',
    radius = 'lg',
    state = 'default',
    intent = 'primary',
    variant = 'solid',
    htmlType = 'button',
    disabled = false,
    className = '',
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
  const isDisabled = disabled || state === 'disabled';
  
  // Neutral and information strictly resolve to ghost variant visually.
  const resolvedVariant: ButtonVariant = intent === 'primary' ? variant : 'ghost';
  
  const visualState: ButtonState =
    isDisabled ? 'disabled' : state === 'pressed' || interactionPressed ? 'pressed' : 'default';

  const pressFromKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isDisabled && (event.key === 'Enter' || event.key === ' ')) setInteractionPressed(true);
  };

  const finalClassName = `totem-button ${className}`.trim();

  return (
    <button
      {...nativeProps}
      ref={ref}
      type={htmlType}
      className={finalClassName}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      data-intent={intent}
      data-state={visualState}
      data-variant={resolvedVariant}
      data-radius={radius}
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
      {showLeftIcon && (
        <IconSlot>
          {leftIcon ?? <DefaultPlusIcon />}
        </IconSlot>
      )}
      <span>{label}</span>
      {showBadge && (
        <span className="totem-button-badge" aria-label={`${badgeText} filtros ativos`}>
          {badgeText}
        </span>
      )}
      {showSecondaryLabel && (
        <>
          <span aria-hidden="true">•</span>
          <span>{secondaryLabel}</span>
        </>
      )}
      {showRightIcon && (
        <IconSlot>
          {rightIcon ?? <DefaultPlusIcon />}
        </IconSlot>
      )}
    </button>
  );
});

Button.displayName = 'Button';
