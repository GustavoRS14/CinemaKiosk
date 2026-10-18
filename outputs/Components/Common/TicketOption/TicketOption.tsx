import React, { useState, useEffect } from 'react';
import './TicketOption.css';
import { Counter, CounterState } from '../Counter';
import { Divider } from '../Divider';

export interface TicketOptionProps {
type?: string;
price?: string;
supportingText?: string;

amount?: number;
/** 
 * Defines how many physical tickets are added or removed by each counter action.
 */
ticketsPerPackage?: number;
/**
 * Callback returns the new physical-ticket quantity and the package size.
 */
onAmountChange?: (newValue: number, ticketsPerPackage: number) => void;
counterState?: CounterState;
/** Shows the validation feedback anchored to this option's counter. */
showValidationTooltip?: boolean;
/** Message forwarded to the validation tooltip inside Counter. */
validationMessage?: string;
/** Stable DOM anchor used to place page-level validation on a visible option. */
validationAnchorId?: string;

className?: string;
}

export const TicketOption: React.FC<TicketOptionProps> = ({
type = 'Tipo',
price = '40,00',
supportingText = 'Texto de suporte',
amount = 0,
ticketsPerPackage = 1,
onAmountChange,
counterState = 'Default',
showValidationTooltip = false,
validationMessage,
validationAnchorId,
className = '',
}) => {
// Internal state allows the counter to work interactively in isolation (Storybook)
const [internalAmount, setInternalAmount] = useState(amount);
const normalizedTicketsPerPackage = Math.max(1, Math.floor(ticketsPerPackage));

useEffect(() => {
  setInternalAmount(amount);
}, [amount]);

const handleAmountChange = (newValue: number) => {
  const direction = Math.sign(newValue - internalAmount);
  const nextAmount = direction > 0
    ? internalAmount + normalizedTicketsPerPackage
    : Math.max(0, internalAmount - normalizedTicketsPerPackage);
  setInternalAmount(nextAmount);
  onAmountChange?.(nextAmount, normalizedTicketsPerPackage);
};

const displayedPrice = (() => {
  if (normalizedTicketsPerPackage === 1) return price;
  const packagePrice = Number(price.replace('.', '').replace(',', '.'));
  if (!Number.isFinite(packagePrice)) return price;
  const selectedPackages = internalAmount / normalizedTicketsPerPackage;
  const resolvedPrice = internalAmount === 0
    ? packagePrice / normalizedTicketsPerPackage
    : packagePrice * selectedPackages;
  return resolvedPrice.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
})();

return (
  <div
    className={`ticket-option ${className}`.trim()}
    data-validation-anchor={validationAnchorId}
  >
    <div className="ticket-option-top">
      <div className="ticket-option-info">
        <div className="ticket-option-type">
          <p>{type}</p>
        </div>
        <div className="ticket-option-price">
          <p>R$</p>
          <p>{displayedPrice}</p>
        </div>
      </div>
      <div className="ticket-option-counter">
        <Counter
          onChange={handleAmountChange}
          state={counterState}
          value={internalAmount}
          showValidationTooltip={showValidationTooltip}
          validationMessage={validationMessage}
        />
      </div>
    </div>
    
    <div className="ticket-option-divider-container">
      <div className="ticket-option-ticket-effect">
        <div className="ticket-option-ellipse" />
        <div className="ticket-option-divider-line">
          <Divider type="Dashed"/>
        </div>
        <div className="ticket-option-ellipse" />
      </div>
    </div>
    
    <div className="ticket-option-bottom">
      <p className="ticket-option-supporting-text">{supportingText}</p>
    </div>
  </div>
);
};
