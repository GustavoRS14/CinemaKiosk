import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import AccessibilityIcon from '@asset-icons/accessibility.svg?react';
import {
  DISPLAY_PREFERENCES_EVENT,
  getThemePreference,
} from './Pages/displayPreferences';
import {
  ACCESSIBILITY_PREFERENCES_EVENT,
  getHighContrastPreference,
  getLoweredScreenPreference,
  getTextScalePreference,
} from './Pages/accessibilityPreferences';
import tokens from './Tokens';
import { getBrandForTenant } from './Tokens/activeBrand';
import {
  getTenantPreference,
  LOCATION_PREFERENCES_EVENT,
} from './Pages/locationPreferences';
import { subscribeToComplexThemeUpdates } from './Pages/complexThemePreferences';
import './high-contrast.css';
import './StoryTokenCanvas.css';

export type StoryTheme = 'Light' | 'Dark';
export type StoryOrientation = 'Vertical' | 'Horizontal';

type TokenRecord = Record<string, unknown>;

const cssName = (segments: string[]) => `--${segments.join('-').replace(/\\s+/g, '-')}`;
const isToken = (value: unknown): value is { $value: unknown } =>
  Boolean(value && typeof value === 'object' && '$value' in (value as TokenRecord));

function tokenAt(
  path: string,
  theme: StoryTheme,
  orientation: StoryOrientation,
  brand: TokenRecord,
): unknown {
  const [collection, ...segments] = path.split('.');
  let cursor: unknown =
    collection === 'Brand'
      ? brand
      : collection === 'Contextual'
      ? (tokens.Contextual as unknown as TokenRecord)[theme]
      : collection === 'Responsive'
        ? (tokens.Responsive as unknown as TokenRecord)[orientation]
        : (tokens as unknown as TokenRecord)[collection];

  for (const segment of segments) {
    if (!cursor || typeof cursor !== 'object') return undefined;
    cursor = (cursor as TokenRecord)[segment];
  }
  return cursor;
}

function toCssValue(
  value: unknown,
  theme: StoryTheme,
  orientation: StoryOrientation,
  brand: TokenRecord,
  contextualPrimaryDefaultOverride?: string,
): string {
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    if (/^\{Semantic\.Primary\.(?:Default|\d+)\}$/.test(value) && contextualPrimaryDefaultOverride) {
      return contextualPrimaryDefaultOverride;
    }
    const target = tokenAt(value.slice(1, -1), theme, orientation, brand) as { $value: unknown };
    if (!target || typeof target !== 'object' || !('$value' in target)) return '';
    return toCssValue(target.$value, theme, orientation, brand, contextualPrimaryDefaultOverride);
  }
  if (
    value &&
    typeof value === 'object' &&
    'value' in value &&
    'unit' in value
  ) {
    const dimension = value as { value: number; unit: string };
    return `${dimension.value}${dimension.unit}`;
  }
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  return String(value);
}

const NORMAL_TEXT_AA_CONTRAST = 4.5;
const PRIMARY_PALETTE_STOPS = ['50', '100', '200', '300', '350', '400', '500', '600', '700', '800', '900'] as const;

const parseHexColor = (color: string): [number, number, number] | null => {
  const match = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (!match) return null;
  const hex = match[1].length === 3
    ? match[1].split('').map((character) => character.repeat(2)).join('')
    : match[1];
  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number];
};

const colorLuminance = (color: string) => {
  const channels = parseHexColor(color);
  if (!channels) return null;
  const [red, green, blue] = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
};

const wcagContrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = colorLuminance(foreground);
  const backgroundLuminance = colorLuminance(background);
  if (foregroundLuminance === null || backgroundLuminance === null) return 1;
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

type ThemePrimaryContrast = {
  passes: boolean;
  originalPasses: boolean;
  minimumRatio: number;
  contextualOverride: string;
  contextualStop: string;
};

const getThemeBackgrounds = (
  theme: StoryTheme,
  orientation: StoryOrientation,
  brand: TokenRecord,
) => [
  toCssValue('{Contextual.Surface.BackgroundPage.Default}', theme, orientation, brand),
  toCssValue('{Contextual.Surface.Secondary.Default}', theme, orientation, brand),
] as const;

const assessColorOnBackgrounds = (color: string, backgrounds: readonly string[]) => {
  const ratios = backgrounds.map((background) => wcagContrastRatio(color, background));
  const minimumRatio = Math.min(...ratios);
  return { passes: minimumRatio >= NORMAL_TEXT_AA_CONTRAST, minimumRatio };
};

const chooseAccessiblePrimary = (
  theme: StoryTheme,
  orientation: StoryOrientation,
  brand: TokenRecord,
  backgrounds: readonly string[],
) => {
  const primary = brand.Primary as TokenRecord | undefined;
  const candidates = PRIMARY_PALETTE_STOPS.flatMap((stop) => {
    const token = primary?.[stop];
    if (!isToken(token)) return [];
    const color = toCssValue(token.$value, theme, orientation, brand);
    const contrast = assessColorOnBackgrounds(color, backgrounds);
    return [{ stop, color, ...contrast }];
  });
  const passingCandidates = candidates.filter((candidate) => candidate.passes);
  if (passingCandidates.length > 0) {
    return passingCandidates.sort((left, right) => (
      Math.abs(Number(left.stop) - 500) - Math.abs(Number(right.stop) - 500)
      || right.minimumRatio - left.minimumRatio
    ))[0];
  }

  return candidates.sort((left, right) => right.minimumRatio - left.minimumRatio)[0];
};

const assessPrimaryContrast = (orientation: StoryOrientation, brand: TokenRecord) => {
  const primaryDefault = toCssValue('{Semantic.Primary.Default}', 'Light', orientation, brand);
  const lightBackgrounds = getThemeBackgrounds('Light', orientation, brand);
  const darkBackgrounds = getThemeBackgrounds('Dark', orientation, brand);
  const originalLight = assessColorOnBackgrounds(primaryDefault, lightBackgrounds);
  const originalDark = assessColorOnBackgrounds(primaryDefault, darkBackgrounds);
  const buildThemeAssessment = (
    theme: StoryTheme,
    backgrounds: readonly string[],
    original: { passes: boolean; minimumRatio: number },
  ): ThemePrimaryContrast => {
    if (original.passes) {
      return {
        ...original,
        originalPasses: true,
        contextualOverride: primaryDefault,
        contextualStop: '500',
      };
    }
    const replacement = chooseAccessiblePrimary(theme, orientation, brand, backgrounds);
    return replacement
      ? {
        passes: replacement.passes,
        originalPasses: false,
        minimumRatio: replacement.minimumRatio,
        contextualOverride: replacement.color,
        contextualStop: replacement.stop,
      }
      : {
        ...original,
        originalPasses: false,
        contextualOverride: primaryDefault,
        contextualStop: '500',
      };
  };

  return {
    Light: buildThemeAssessment('Light', lightBackgrounds, originalLight),
    Dark: buildThemeAssessment('Dark', darkBackgrounds, originalDark),
  };
};

export function recommendThemeForTenant(
  orientation: StoryOrientation,
  tenant?: string,
): 'light' | 'dark' {
  const brand = getBrandForTenant(tenant) as unknown as TokenRecord;
  const assessment = assessPrimaryContrast(orientation, brand);
  return selectRecommendedTheme(assessment);
}

const selectRecommendedTheme = (
  assessment: ReturnType<typeof assessPrimaryContrast>,
): 'light' | 'dark' => {
  if (assessment.Light.originalPasses && !assessment.Dark.originalPasses) return 'light';
  if (assessment.Dark.originalPasses && !assessment.Light.originalPasses) return 'dark';
  return assessment.Light.minimumRatio >= assessment.Dark.minimumRatio ? 'light' : 'dark';
};

function collectCssVariables(
  node: unknown,
  path: string[],
  theme: StoryTheme,
  orientation: StoryOrientation,
  brand: TokenRecord,
  result: CSSProperties & Record<string, string>,
  contextualPrimaryDefaultOverride?: string,
) {
  if (!node || typeof node !== 'object') return;

  if (isToken(node)) {
    const value = node.$value;
    if (
      value &&
      typeof value === 'object' &&
      !('value' in value && 'unit' in value)
    ) {
      for (const [field, fieldValue] of Object.entries(value as TokenRecord)) {
        result[cssName([...path, field])] = toCssValue(fieldValue, theme, orientation, brand, contextualPrimaryDefaultOverride);
      }
    } else {
      result[cssName(path)] = toCssValue(value, theme, orientation, brand, contextualPrimaryDefaultOverride);
    }
    return;
  }

  for (const [key, child] of Object.entries(node as TokenRecord)) {
    if (!key.startsWith('$')) collectCssVariables(child, [...path, key], theme, orientation, brand, result, contextualPrimaryDefaultOverride);
  }
}

export function tokenStyles(
  theme: StoryTheme,
  orientation: StoryOrientation,
  tenant?: string,
  highContrast = getHighContrastPreference(),
  textScale = getTextScalePreference(),
) {
  const result = {} as CSSProperties & Record<string, string>;
  const brand = getBrandForTenant(tenant) as unknown as TokenRecord;
  const primaryContrast = assessPrimaryContrast(orientation, brand);
  const contextualPrimaryDefaultOverride = primaryContrast[theme].contextualOverride;
  collectCssVariables(tokens.Primitive, ['Primitive'], theme, orientation, brand, result);
  collectCssVariables(brand, ['Brand'], theme, orientation, brand, result);
  collectCssVariables(tokens.Semantic, ['Semantic'], theme, orientation, brand, result);
  collectCssVariables(
    (tokens.Responsive as unknown as TokenRecord)[orientation],
    ['Responsive'],
    theme,
    orientation,
    brand,
    result,
  );
  collectCssVariables(
    (tokens.Contextual as unknown as TokenRecord)[theme],
    ['Contextual'],
    theme,
    orientation,
    brand,
    result,
  );
  const contextualTheme = (tokens.Contextual as unknown as TokenRecord)[theme] as TokenRecord;
  for (const group of ['Text', 'Icon', 'Border'] as const) {
    collectCssVariables(
      contextualTheme[group],
      ['Contextual', group],
      theme,
      orientation,
      brand,
      result,
      contextualPrimaryDefaultOverride,
    );
  }

  const brandAsset = contextualTheme.BrandAsset as TokenRecord | undefined;
  const whiteColor = brandAsset?.WhiteColor as TokenRecord | undefined;
  const whiteColorMain = whiteColor?.main;
  const whiteColorBrandText = whiteColor?.BrandText;
  const whiteColorPrimaryAndTextUseWhite = isToken(whiteColorMain)
    && whiteColorMain.$value === '{Semantic.Foundations.White}'
    && (
      whiteColorBrandText === undefined
      || (isToken(whiteColorBrandText) && whiteColorBrandText.$value === '{Semantic.Foundations.White}')
    );
  if (highContrast) {
    const highContrastMode = (tokens.ContextualHighContrast as unknown as TokenRecord)[theme] as TokenRecord;
    collectCssVariables(highContrastMode.Text, ['Contextual', 'Text'], theme, orientation, brand, result);
    collectCssVariables(highContrastMode.Text, ['Accessibility', 'Text'], theme, orientation, brand, result);
    collectCssVariables(highContrastMode.Contrast, ['Contextual', 'Contrast'], theme, orientation, brand, result);
    collectCssVariables(highContrastMode.Contrast, ['Accessibility', 'Contrast'], theme, orientation, brand, result);
    collectCssVariables(highContrastMode.Icon, ['Accessibility', 'Icon'], theme, orientation, brand, result);
  }

  const foundationsBlack = toCssValue(
    '{Semantic.Foundations.Black}',
    theme,
    orientation,
    brand,
  );
  const applyButtonOnColorContrast = (
    state: '' | 'Pressed',
    surfaceVariable: string,
  ) => {
    const textVariable = `--Contextual-Text-Primary-onColor${state}`;
    const iconVariable = `--Contextual-Icon-Primary-onColor${state}`;
    const buttonTextVariable = `--Button-Text-Primary-onColor${state}`;
    const buttonIconVariable = `--Button-Icon-Primary-onColor${state}`;
    const surface = result[surfaceVariable];
    const currentText = result[textVariable];
    const currentIcon = result[iconVariable];
    const accessibleText = surface
      && currentText
      && wcagContrastRatio(currentText, surface) < NORMAL_TEXT_AA_CONTRAST
      ? foundationsBlack
      : currentText;
    const accessibleIcon = surface
      && currentIcon
      && wcagContrastRatio(currentIcon, surface) < NORMAL_TEXT_AA_CONTRAST
      ? foundationsBlack
      : currentIcon;

    if (accessibleText) result[buttonTextVariable] = accessibleText;
    if (accessibleIcon) result[buttonIconVariable] = accessibleIcon;
  };

  applyButtonOnColorContrast('', '--Contextual-Surface-Primary-Default');
  result['--Button-Text-Primary-onColorPressed'] =
    result['--Button-Text-Primary-onColor'] === foundationsBlack
      ? foundationsBlack
      : result['--Contextual-Text-Primary-onColorPressed'];
  result['--Button-Icon-Primary-onColorPressed'] =
    result['--Button-Icon-Primary-onColor'] === foundationsBlack
      ? foundationsBlack
      : result['--Contextual-Icon-Primary-onColorPressed'];
  if (whiteColorPrimaryAndTextUseWhite) {
    result['--BrandLogo-Default-SharedWhiteColor'] = result['--Button-Icon-Primary-onColor'];
  }

  collectCssVariables(tokens.Typography, ['Typography'], theme, orientation, brand, result);

  if (textScale !== 1) {
    const scalableToken = /^(--Responsive-Font-.*-(?:TextSize|LineHeight|ParagraphSpacing)|--Typography-.*-(?:fontSize|lineHeight|paragraphSpacing))$/;
    for (const [property, value] of Object.entries(result)) {
      if (!scalableToken.test(property) || typeof value !== 'string') continue;
      const dimension = value.match(/^(-?\d+(?:\.\d+)?)px$/);
      if (!dimension) continue;
      result[property] = `${Number(dimension[1]) * textScale}px`;
    }
  }

  result['--Accessibility-TextScale'] = String(textScale);
  return result;
}

export function StoryTokenCanvas({
  children,
  theme = 'Light',
  orientation = 'Vertical',
  fullBleed = false,
}: {
  children: ReactNode;
  theme?: StoryTheme;
  orientation?: StoryOrientation;
  fullBleed?: boolean;
}) {
  const [systemTheme, setSystemTheme] = useState<StoryTheme>(() => (
    getThemePreference() === 'dark' ? 'Dark' : theme
  ));
  const [tenant, setTenant] = useState(() => getTenantPreference());
  const [highContrast, setHighContrast] = useState(getHighContrastPreference);
  const [textScale, setTextScale] = useState(getTextScalePreference);
  const [loweredScreen, setLoweredScreen] = useState(getLoweredScreenPreference);

  useEffect(() => {
    return subscribeToComplexThemeUpdates();
  }, []);

  useEffect(() => {
    const updateTheme = () => setSystemTheme(getThemePreference() === 'dark' ? 'Dark' : 'Light');
    window.addEventListener(DISPLAY_PREFERENCES_EVENT, updateTheme);
    window.addEventListener('storage', updateTheme);
    return () => {
      window.removeEventListener(DISPLAY_PREFERENCES_EVENT, updateTheme);
      window.removeEventListener('storage', updateTheme);
    };
  }, []);

  useEffect(() => {
    const updateAccessibility = () => {
      setHighContrast(getHighContrastPreference());
      setTextScale(getTextScalePreference());
      setLoweredScreen(getLoweredScreenPreference());
    };
    document.documentElement.dataset.highContrast = String(getHighContrastPreference());
    document.documentElement.dataset.textScale = getTextScalePreference().toFixed(1);
    document.documentElement.dataset.loweredScreen = String(getLoweredScreenPreference());
    window.addEventListener(ACCESSIBILITY_PREFERENCES_EVENT, updateAccessibility);
    window.addEventListener('storage', updateAccessibility);
    return () => {
      window.removeEventListener(ACCESSIBILITY_PREFERENCES_EVENT, updateAccessibility);
      window.removeEventListener('storage', updateAccessibility);
    };
  }, []);

  useEffect(() => {
    const updateTenant = () => {
      const nextTenant = getTenantPreference();
      setTenant(nextTenant);
      void window.totemDesktop?.updateTenantIcon(nextTenant);
    };
    updateTenant();
    window.addEventListener(LOCATION_PREFERENCES_EVENT, updateTenant);
    window.addEventListener('storage', updateTenant);
    return () => {
      window.removeEventListener(LOCATION_PREFERENCES_EVENT, updateTenant);
      window.removeEventListener('storage', updateTenant);
    };
  }, []);

  const activeTheme = systemTheme === 'Dark' ? 'Dark' : theme;
  const recommendedTheme = recommendThemeForTenant(orientation, tenant);
  const isLoweredScreen = orientation === 'Vertical' && loweredScreen;

  return (
    <>
      <style>{tokens.$extensions?.googleFonts?.cssImport}</style>
      <div
        className={`story-token-canvas${isLoweredScreen ? ' story-token-canvas--lowered' : ''}`}
        data-theme={activeTheme.toLowerCase()}
        data-recommended-theme={recommendedTheme}
        data-high-contrast={highContrast}
        data-lowered-screen={isLoweredScreen}
        data-text-scale={textScale.toFixed(1)}
        data-orientation={orientation.toLowerCase()}
        style={{
          ...tokenStyles(activeTheme, orientation, tenant, highContrast, textScale),
          alignItems: isLoweredScreen ? 'stretch' : 'center',
          background: 'var(--Contextual-Surface-BackgroundPage-Default)',
          boxSizing: 'border-box',
          display: isLoweredScreen ? 'grid' : 'flex',
          gridTemplateRows: isLoweredScreen ? '50dvh 50dvh' : undefined,
          inset: isLoweredScreen ? 0 : undefined,
          justifyContent: isLoweredScreen ? 'stretch' : 'center',
          minBlockSize: isLoweredScreen ? '100dvh' : 'var(--Primitive-Scale-1700)',
          overflow: isLoweredScreen ? 'hidden' : undefined,
          padding: isLoweredScreen || fullBleed ? 0 : 'var(--Responsive-Spacing-xl)',
          position: isLoweredScreen ? 'fixed' : undefined,
          width: isLoweredScreen ? '100%' : undefined,
        }}
      >
        {isLoweredScreen && (
          <div className="story-token-canvas__lowered-region" aria-hidden="true">
            <AccessibilityIcon className="story-token-canvas__lowered-icon" />
          </div>
        )}
        {isLoweredScreen ? (
          <div className="story-token-canvas__lowered-content">{children}</div>
        ) : children}
      </div>
    </>
  );
}
