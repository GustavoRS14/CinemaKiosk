import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  getBrandAsset,
  getBrandAssetByName,
  getBrandSvgSource,
  getBrandSvgSourceByName,
} from '../../../Assets/BrandLogo/Registry';
import { getBrandPaletteCountForTenant } from '../../Tokens/activeBrand';
import {
  getTenantPreference,
  LOCATION_PREFERENCES_EVENT,
} from '../../Pages/locationPreferences';
import {
  DISPLAY_PREFERENCES_EVENT,
  getThemePreference,
} from '../../Pages/displayPreferences';
import './BrandLogo.css';

export type BrandLogoProps = {
  className?: string;
  tenant?: string;
  type?: 'Standard' | 'Fidelity';
  format?: 'Full' | 'Compact';
  colorVariant?: 'Default' | 'White' | 'DefaultColor' | 'WhiteColor';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  hideWhenMissing?: boolean;
  matchPrimarySurfaceContrast?: boolean;
  primaryFoundationOverride?: 'Black' | 'White';
  textFoundationOverride?: 'Black' | 'White';
  imageVariantContext?: 'CustomerHeaderDefault' | 'CustomerHeaderPurchaseOrOffline';
};

const SVG_IMAGE_ELEMENT = /<image(?=[\s/>])/i;
const SVG_PAINTABLE_ELEMENT = /<(?:path|polygon|rect|circle|ellipse|line|polyline|text)\b[^>]*>/gi;
const BRAND_PRIMARY_MARKER = /\b(?:id|class)=["'][^"']*brand-primary/i;
const BRAND_ROLE_MARKER = /brand-(primary|accent|text|tertiary)/i;

const isMonochromePrimarySvg = (source: string) => {
  const paintableElements = source.match(SVG_PAINTABLE_ELEMENT) ?? [];
  return paintableElements.length > 0
    && paintableElements.every((element) => BRAND_PRIMARY_MARKER.test(element));
};

const hasOnlyPrimaryAndTextRoles = (source: string) => {
  const paintableElements = source.match(SVG_PAINTABLE_ELEMENT) ?? [];
  if (paintableElements.length === 0) return false;
  const roles = new Set<string>();
  for (const element of paintableElements) {
    const role = element.match(BRAND_ROLE_MARKER)?.[1]?.toLowerCase();
    if (!role) return false;
    roles.add(role);
  }
  return roles.size === 2 && roles.has('primary') && roles.has('text');
};

const applyFoundationFill = (
  source: string,
  role: 'primary' | 'text',
  foundation?: 'Black' | 'White',
) => {
  if (!foundation) return source;
  const token = `var(--Semantic-Foundations-${foundation}, ${foundation === 'Black' ? '#000000' : '#FFFFFF'})`;
  const roleElement = new RegExp(
    `<(?:path|polygon|rect|circle|ellipse|line|polyline|text)\\b[^>]*(?:id|class)=["'][^"']*brand-${role}[^"']*["'][^>]*>`,
    'gi',
  );

  return source.replace(roleElement, (element) => {
    const selfClosing = /\/\s*>$/.test(element);
    const close = selfClosing ? '/>' : '>';
    let opening = element.replace(/\/\s*>$|>$/, '');
    if (/\sstyle=["']/i.test(opening)) {
      opening = opening.replace(
        /\sstyle=(["'])(.*?)\1/i,
        (_match, quote: string, styles: string) => ` style=${quote}${styles}; fill: ${token} !important${quote}`,
      );
    } else {
      opening += ` style="fill: ${token} !important"`;
    }
    return `${opening}${close}`;
  });
};

export const BrandLogo = ({
  className = '',
  tenant,
  type = 'Standard',
  format = 'Full',
  colorVariant = 'DefaultColor',
  size = 'md',
  hideWhenMissing = false,
  matchPrimarySurfaceContrast = false,
  primaryFoundationOverride,
  textFoundationOverride,
  imageVariantContext,
}: BrandLogoProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [locationTenant, setLocationTenant] = useState(() => getTenantPreference());
  const [activeTheme, setActiveTheme] = useState(() => getThemePreference());
  const [buttonContentIsBlack, setButtonContentIsBlack] = useState(false);
  const resolvedTenant = tenant || locationTenant;
  const resolvedColorVariant = colorVariant === 'Default'
    ? 'DefaultColor'
    : colorVariant === 'White'
      ? 'WhiteColor'
      : colorVariant;

  const defaultLogoSrc = getBrandAsset(resolvedTenant, type, format);
  const defaultSvgContent = getBrandSvgSource(resolvedTenant, type, format);
  const requestedImageVariant = type === 'Fidelity' && format === 'Full'
    ? `Fidelity_Full_${activeTheme === 'dark' ? 'White' : 'Black'}`
    : type === 'Standard' && format === 'Full' && imageVariantContext === 'CustomerHeaderPurchaseOrOffline'
      ? `Standard_Full_${activeTheme === 'dark' ? 'White' : 'Black'}`
      : type === 'Standard' && format === 'Full' && imageVariantContext === 'CustomerHeaderDefault'
        ? `Standard_Full_Total${buttonContentIsBlack ? 'Black' : 'White'}`
        : null;
  const variantLogoSrc = requestedImageVariant
    ? getBrandAssetByName(resolvedTenant, requestedImageVariant)
    : null;
  const variantSvgContent = requestedImageVariant
    ? getBrandSvgSourceByName(resolvedTenant, requestedImageVariant)
    : null;
  const variantIsRaster = Boolean(
    variantLogoSrc
    && (!variantSvgContent || SVG_IMAGE_ELEMENT.test(variantSvgContent)),
  );
  const logoSrc = variantIsRaster ? variantLogoSrc : defaultLogoSrc;
  const svgContent = variantIsRaster ? variantSvgContent : defaultSvgContent;
  const hasEmbeddedRaster = Boolean(svgContent && SVG_IMAGE_ELEMENT.test(svgContent));
  const isRaster = Boolean(logoSrc && (!svgContent || hasEmbeddedRaster));
  const monochromePrimary = Boolean(
    svgContent
    && !hasEmbeddedRaster
    && isMonochromePrimarySvg(svgContent),
  );
  const primaryAndTextOnly = Boolean(
    svgContent
    && !hasEmbeddedRaster
    && hasOnlyPrimaryAndTextRoles(svgContent),
  );
  const singlePalette = getBrandPaletteCountForTenant(resolvedTenant) === 1;
  const renderedSvgContent = primaryAndTextOnly
    ? applyFoundationFill(
      applyFoundationFill(svgContent ?? '', 'primary', primaryFoundationOverride),
      'text',
      textFoundationOverride,
    )
    : svgContent;

  useEffect(() => {
    const updatePreferences = () => {
      setLocationTenant(getTenantPreference());
      setActiveTheme(getThemePreference());
    };
    window.addEventListener(LOCATION_PREFERENCES_EVENT, updatePreferences);
    window.addEventListener(DISPLAY_PREFERENCES_EVENT, updatePreferences);
    window.addEventListener('storage', updatePreferences);
    return () => {
      window.removeEventListener(LOCATION_PREFERENCES_EVENT, updatePreferences);
      window.removeEventListener(DISPLAY_PREFERENCES_EVENT, updatePreferences);
      window.removeEventListener('storage', updatePreferences);
    };
  }, []);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    const renderedTheme = wrapperRef.current.closest<HTMLElement>('[data-theme]')?.dataset.theme;
    if (renderedTheme === 'light' || renderedTheme === 'dark') {
      setActiveTheme((current) => current === renderedTheme ? current : renderedTheme);
    }
    if (imageVariantContext !== 'CustomerHeaderDefault') return;
    const value = getComputedStyle(wrapperRef.current)
      .getPropertyValue('--Button-Icon-Primary-onColor')
      .trim()
      .replace(/\s+/g, '')
      .toLowerCase();
    setButtonContentIsBlack(
      value === '#000'
      || value === '#000000'
      || value === 'black'
      || value === 'rgb(0,0,0)'
      || value === 'rgba(0,0,0,1)',
    );
  }, [activeTheme, imageVariantContext, resolvedTenant]);

  if (!logoSrc) {
    if (hideWhenMissing) return null;
    return <div className={`brand-logo-missing ${className}`.trim()}>Logo não encontrada</div>;
  }

  /* CRITICAL FIX: Render raster images normally without SVG painting */
  if (isRaster) {
    return (
      <div
        ref={wrapperRef}
        className={`brand-logo-wrapper ${className}`.trim()} 
        data-size={size}
      >
        <img 
          src={logoSrc} 
          alt={`${resolvedTenant} logo`} 
          style={{ height: '100%', width: 'auto', display: 'block' }} 
        />
      </div>
    );
  }

  // Loading state for SVGs
  if (!svgContent) {
    return <div className={`brand-logo-loading ${className}`.trim()} style={{ width: '100%', height: '100%' }} />;
  }

  /* Renders vector SVGs with the dynamic painting logic intact */
  return (
    <div
      ref={wrapperRef}
      className={`brand-logo-wrapper ${className}`.trim()} 
      data-color-variant={resolvedColorVariant}
      data-primary-surface-contrast={matchPrimarySurfaceContrast && monochromePrimary}
      data-brand-roles={primaryAndTextOnly ? 'primary-text' : undefined}
      data-single-palette={singlePalette}
      data-size={size}
      dangerouslySetInnerHTML={{ __html: renderedSvgContent ?? '' }} 
    />
  );
};
