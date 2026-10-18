import React, { forwardRef, useState, useEffect, useRef, type HTMLAttributes } from 'react';
import './ColorSample.css';

export type ColorSampleProps = HTMLAttributes<HTMLDivElement> & {
  /** CSS color value (hex, rgb, or CSS variable like var(--Semantic-Primary-Default)) */
  colorValue?: string;
};

const rgbToHex = (val: string) => {
  if (val.startsWith('#')) return val.toUpperCase();

  // Extract RGB numbers
  const rgb = val.match(/\d+/g);
  if (!rgb || rgb.length < 3) return val.toUpperCase();

  const hex = rgb.slice(0, 3).map(x => {
    const hexStr = parseInt(x, 10).toString(16);
    return hexStr.length === 1 ? '0' + hexStr : hexStr;
  }).join('');

  return `#${hex}`.toUpperCase();
};

export const ColorSample = forwardRef<HTMLDivElement, ColorSampleProps>(function ColorSample(
  { className, colorValue = 'var(--Semantic-Primary-Default)', ...nativeProps },
  ref
) {
  const swatchRef = useRef<HTMLDivElement>(null);
  const [displayHex, setDisplayHex] = useState(colorValue);

  useEffect(() => {
    if (swatchRef.current) {
      // Reads the actual rendered color from the browser DOM
      const computedColor = getComputedStyle(swatchRef.current).backgroundColor;
      setDisplayHex(rgbToHex(computedColor));
    }
  }, [colorValue]);

  return (
    <div
      {...nativeProps}
      ref={ref}
      className={`totem-color-sample ${className || ''}`.trim()}
    >
      <div 
        ref={swatchRef}
        className="totem-color-sample__swatch" 
        style={{ backgroundColor: colorValue }} 
      />
      <div className="totem-color-sample__text-wrapper">
        <p className="totem-color-sample__text">{displayHex}</p>
      </div>
    </div>
  );
});

ColorSample.displayName = 'ColorSample';
