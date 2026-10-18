import React from 'react';
import { VendorLogo } from '../../../Utilities/Vendor/VendorLogo';
import './MetadataBar.css';

export interface MetadataBarProps {
  version: string;
  onVersionClick?: () => void;
}

export function MetadataBar({ version, onVersionClick }: MetadataBarProps) {
  return (
    <div className="metadata-bar">
      <div className="metadata-bar__left">
        <span className="metadata-bar__powered-by">Powered By</span>
        <VendorLogo className="metadata-bar__vendor-logo" />
      </div>
      <div className="metadata-bar__right">
        <button type="button" className="metadata-bar__version" onClick={onVersionClick}>
          {version}
        </button>
      </div>
    </div>
  );
}

MetadataBar.displayName = 'MetadataBar';
