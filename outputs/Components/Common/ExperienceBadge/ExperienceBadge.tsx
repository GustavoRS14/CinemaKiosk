import React from 'react';
import './ExperienceBadge.css';

// Using relative paths, but omitting ?react to respect the project's global SVG loader config
import DolbyAtmosIcon from '../../../../Assets/Experiences/DolbyAtmos.svg';
import RealD3DIcon from '../../../../Assets/Experiences/RealD3D.svg';
import IMAXIcon from '../../../../Assets/Experiences/IMAX.svg';
import LaserIcon from '../../../../Assets/Experiences/Laser.svg';
import InfinityVisionIcon from '../../../../Assets/Experiences/InfinityVision.svg';
import VIPIcon from '../../../../Assets/Experiences/VIP.svg';

export type ExperienceType = 'Dolby Atmos' | '3D' | 'IMAX' | 'Laser' | 'Infinity Vision' | 'VIP';

export interface ExperienceBadgeProps {
  /** The experience technology to display */
  experience: ExperienceType;
  /** Optional class name for the outer wrapper ONLY */
  className?: string;
}

export const ExperienceBadge: React.FC<ExperienceBadgeProps> = ({
  experience,
  className = '',
}) => {
  const renderIcon = () => {
    // Rendered purely as React components relying on the global SVGR loader
    switch (experience) {
      case 'Dolby Atmos':
        return <DolbyAtmosIcon />;
      case '3D':
        return <RealD3DIcon />;
      case 'IMAX':
        return <IMAXIcon />;
      case 'Laser':
        return <LaserIcon />;
      case 'Infinity Vision':
        return <InfinityVisionIcon />;
      case 'VIP':
        return <VIPIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={`experience-badge-wrapper ${className}`.trim()} data-experience={experience}>
      {renderIcon()}
    </div>
  );
};
