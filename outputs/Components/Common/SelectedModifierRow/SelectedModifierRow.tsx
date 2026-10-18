import React from 'react';
import { Tag } from '../Tag';
import './SelectedModifierRow.css';

export interface SelectedModifierRowProps {
  /** Optional custom class name */
  className?: string;
  /** Figma Text property */
  modifierName?: string;
}

export function SelectedModifierRow({
  className = "",
  modifierName = "Nome do Produto",
}: SelectedModifierRowProps) {
  return (
    <div className={`totem-selected-modifier-row ${className}`.trim()}>
      <div className="totem-selected-modifier-row__tag-wrapper">
        <Tag status="Neutral" state="Default" text="1" />
      </div>
      <p className="totem-selected-modifier-row__name">{modifierName}</p>
    </div>
  );
}
