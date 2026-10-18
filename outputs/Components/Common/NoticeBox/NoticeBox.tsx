import React from 'react';
import './NoticeBox.css';

export type NoticeBoxStatus = 'Brand' | 'Information' | 'Success' | 'Warning' | 'Error' | 'Neutral';
export type NoticeBoxBorderRadius = 'xs' | 'sm' | 'md' | 'lg';

export interface NoticeBoxProps {
  /**
   * The status variant that dictates the visual coloring and semantics.
   */
  status?: NoticeBoxStatus;
  /**
   * The border radius size variant.
   */
  borderRadius?: NoticeBoxBorderRadius;
  /**
   * The main content or description text.
   */
  message: string;
  /**
   * An optional leading icon.
   */
  icon?: React.ReactNode;
}

export const NoticeBox: React.FC<NoticeBoxProps> = ({
  status = 'Information',
  borderRadius = 'xs',
  message,
  icon,
}) => {
  return (
    <div className={`notice-box notice-box--${status.toLowerCase()} notice-box--radius-${borderRadius}`} role="alert">
      {icon && (
        <div className="notice-box__icon-wrapper">
          {icon}
        </div>
      )}
      <div className="notice-box__content">
        <p className="notice-box__message">{message}</p>
      </div>
    </div>
  );
};
