import { type CSSProperties } from 'react';
import './Validation_Tooltip.css';

export type Validation_TooltipProps = {
  /** The text message displayed in the tooltip. */
  text: string;
  /** Additional CSS classes. */
  className?: string;
  /** Optional inline styles. */
  style?: CSSProperties;
};

export function Validation_Tooltip({
  text,
  className,
  style,
}: Validation_TooltipProps) {
  return (
    <div className={`validation-tooltip-container ${className || ''}`.trim()} style={style}>
      <div className="validation-tooltip-message">
        <p className="validation-tooltip-text">{text}</p>
      </div>
      <div className="validation-tooltip-arrow">
        <svg
          viewBox="0 0 21 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10.5 15L0 0H21L10.5 15Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
