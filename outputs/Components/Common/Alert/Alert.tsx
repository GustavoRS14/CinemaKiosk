import { useState, type CSSProperties, type ReactNode } from 'react';
import { CloseButton } from '../CloseButton';
import './Alert.css';

export type AlertIntent = 'Neutral' | 'Success' | 'Error' | 'Warning' | 'Information';

export type AlertProps = {
  /** The intent color scheme of the alert. Matches Figma Intent property. */
  intent?: AlertIntent;
  /** The title of the alert. */
  title: ReactNode;
  /** The description text of the alert. */
  description?: ReactNode;
  /** Controlled visibility state. */
  isVisible?: boolean;
  /** Callback fired when the close button is clicked. */
  onClose?: () => void;
  /** Whether the close action is displayed. */
  showCloseButton?: boolean;
  /** Additional CSS classes for the container. */
  className?: string;
  /** Optional inline styles. */
  style?: CSSProperties;
};

export function Alert({
  intent = 'Neutral',
  title,
  description,
  isVisible: controlledIsVisible,
  onClose,
  showCloseButton = true,
  className = '',
  style,
}: AlertProps) {
  const [uncontrolledIsVisible, setUncontrolledIsVisible] = useState(true);
  
  const isVisible = controlledIsVisible !== undefined ? controlledIsVisible : uncontrolledIsVisible;

  if (!isVisible) return null;

  const handleClose = () => {
    if (controlledIsVisible === undefined) {
      setUncontrolledIsVisible(false);
    }
    onClose?.();
  };

  return (
    <div 
      className={`totem-alert ${className}`.trim()} 
      style={style} 
      role="alert" 
      data-intent={intent}
    >
      <div className="totem-alert__title-row">
        <div className="totem-alert__title">{title}</div>
        {showCloseButton && (
          <CloseButton
            type="Ghost"
            onClick={handleClose}
            aria-label="Fechar alerta"
          />
        )}
      </div>
      {description && (
        <div className="totem-alert__description">
          {description}
        </div>
      )}
    </div>
  );
}
