import React from 'react';
import './TicketGroup.css';
import { TicketOption, TicketOptionProps } from '../TicketOption';
import { Divider } from '../Divider';

export type TicketGroupOption = Omit<TicketOptionProps, 'className' | 'amount' | 'onAmountChange'> & {
  id: string | number;
  amount?: number;
};

export interface TicketGroupProps {
  className?: string;
  showTitle?: boolean;
  title?: string;
  seatType?: string;
  options?: TicketGroupOption[];
  onOptionChange?: (id: string | number, amount: number) => void;
}

export const TicketGroup: React.FC<TicketGroupProps> = ({
  className = '',
  showTitle = false,
  title = 'Poltrona',
  seatType = '[Type]',
  options = [],
  onOptionChange,
}) => {
  return (
    <div className={`ticket-group ${className}`.trim()}>
      {showTitle && (
        <div className="ticket-group-header">
          <div className="ticket-group-title">
            <p>{title}</p>
            <p>{seatType}</p>
          </div>
          <div className="ticket-group-divider">
            <Divider type="Solid" />
          </div>
        </div>
      )}
      <div className="ticket-group-options">
        {options.map((option) => (
          <TicketOption
            key={option.id}
            {...option}
            onAmountChange={(val) => onOptionChange?.(option.id, val)}
          />
        ))}
      </div>
    </div>
  );
};
