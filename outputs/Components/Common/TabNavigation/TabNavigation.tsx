import React, { useState } from 'react';
import { Tab } from './Tab';
import './TabNavigation.css';

export interface TabNavigationProps {
  /** Optional custom class name */
  className?: string;
  /** Figma Boolean property */
  box?: boolean;
  /** Figma Boolean property */
  prop3rd?: boolean;
  /** Figma Boolean property */
  prop4th?: boolean;
  /** Figma Boolean property */
  prop5th?: boolean;
}

export function TabNavigation({
  className = "",
  box = true,
  prop3rd = true,
  prop4th = false,
  prop5th = false,
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className={`totem-tab-navigation ${className}`.trim()}>
      <Tab selected={activeTab === 0} text="Texto" onClick={() => setActiveTab(0)} />
      <Tab selected={activeTab === 1} text="Texto" onClick={() => setActiveTab(1)} />
      {prop3rd && <Tab selected={activeTab === 2} text="Texto" onClick={() => setActiveTab(2)} />}
      {prop4th && <Tab selected={activeTab === 3} text="Texto" onClick={() => setActiveTab(3)} />}
      {prop5th && <Tab selected={activeTab === 4} text="Texto" onClick={() => setActiveTab(4)} />}
    </div>
  );
}
