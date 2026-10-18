import React from 'react';
import './PaymentOption.css';

export interface PaymentOptionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const PaymentOption: React.FC<PaymentOptionProps> = ({ 
  title, 
  description, 
  icon,
  className = '',
  ...props 
}) => {
  return (
    <button className={`payment-option ${className}`.trim()} {...props}>
      {icon && (
        <div className="payment-option-icon-wrapper">
          {icon}
        </div>
      )}
      <div className="payment-option-content">
        <h5 className="payment-option-title">{title}</h5>
        {description && <p className="payment-option-description">{description}</p>}
      </div>
    </button>
  );
};
