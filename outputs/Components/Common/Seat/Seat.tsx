import React, { useState, useEffect } from 'react';
import SeatIcon from '@icons/seat.svg';
import CloseIcon from '@icons/close.svg';
import ArrowLeftRightIcon from '@icons/arrow-left-right.svg';
import WheelchairIcon from '@icons/wheelchair.svg';
import DiamondIcon from '@icons/diamond.svg';
import './Seat.css';

export interface SeatProps {
  className?: string;
  state?: 'Available' | 'Selected' | 'Occupied';
  type?: 'Standard' | 'Obese' | 'Wheelchair' | 'Companion' | 'VIP' | 'Super';
  seatNumber?: string;
  context?: 'Map' | 'Legend';
  onClick?: (newState: 'Available' | 'Selected' | 'Occupied') => boolean | void;
}

export const Seat: React.FC<SeatProps> = ({
  className = '',
  state = 'Available',
  type = 'Standard',
  seatNumber = '',
  context = 'Map',
  onClick,
}) => {
  const [internalState, setInternalState] = useState(state);

  useEffect(() => {
    setInternalState(state);
  }, [state]);

  const isOccupied = internalState === 'Occupied';
  const isLegend = context === 'Legend';

  const handleClick = () => {
    if (isOccupied || isLegend) return;
    const newState = internalState === 'Available' ? 'Selected' : 'Available';
    const selectionAccepted = onClick?.(newState);
    if (selectionAccepted === false) return;
    setInternalState(newState);
  };

  const renderInnerContent = () => {
    // 1. Standard Variant Logic
    if (type === 'Standard') {
      return (
        <>
          <SeatIcon className="seat-component__icon" />
          {isOccupied && <CloseIcon className="seat-component__close-icon" />}
          {!isOccupied && !isLegend && seatNumber && (
            <span className="seat-component__text">{seatNumber}</span>
          )}
        </>
      );
    }

    // 2. CRITICAL FIX: Wheelchair Special Rendering (Available & Occupied ONLY)
    // The Selected state is untouched and falls through to the inner wrapper below.
    if (type === 'Wheelchair' && (internalState === 'Available' || internalState === 'Occupied')) {
      return <WheelchairIcon className="seat-component__wheelchair-icon" />;
    }

    // 3. Shared Variant Logic (Obese, VIP, Super, Companion, and Wheelchair Selected)
    return (
      <div className="seat-component__variant-inner">
        {(internalState === 'Available' || internalState === 'Occupied') && (
          <>
            {type === 'Obese' && <ArrowLeftRightIcon className="seat-component__variant-icon" />}
            {(type === 'VIP' || type === 'Super') && <DiamondIcon className="seat-component__variant-icon" />}
            {type === 'Companion' && <span className="seat-component__companion-text">AC</span>}
          </>
        )}
        {internalState === 'Selected' && !isLegend && seatNumber && (
          <span className="seat-component__text">{seatNumber}</span>
        )}
      </div>
    );
  };

  return (
    <button
      type="button"
      className={`seat-component ${className}`.trim()}
      data-state={internalState}
      data-context={context}
      data-type={type}
      disabled={isOccupied || isLegend}
      onClick={handleClick}
      aria-label={`Assento ${type} ${internalState} ${seatNumber}`}
    >
      {renderInnerContent()}
    </button>
  );
};
