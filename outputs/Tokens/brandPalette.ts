export type ColorToken = {
  $type?: string;
  $value?: string;
  $extensions?: Record<string, unknown>;
};

export type BrandPalette = Record<string, unknown>;

export const PALETTE_STOPS = ['50', '100', '200', '300', '350', '400', '500', '600', '700', '800', '900'] as const;

const STOP_MIXES: Record<(typeof PALETTE_STOPS)[number], { background: '#FFFFFF' | '#000000'; opacity: number } | null> = {
  '50': { background: '#FFFFFF', opacity: 0.1 },
  '100': { background: '#FFFFFF', opacity: 0.2 },
  '200': { background: '#FFFFFF', opacity: 0.4 },
  '300': { background: '#FFFFFF', opacity: 0.6 },
  '350': { background: '#FFFFFF', opacity: 0.7 },
  '400': { background: '#FFFFFF', opacity: 0.8 },
  '500': null,
  '600': { background: '#000000', opacity: 0.8 },
  '700': { background: '#000000', opacity: 0.6 },
  '800': { background: '#000000', opacity: 0.4 },
  '900': { background: '#000000', opacity: 0.2 },
};

export const isColorToken = (value: unknown): value is ColorToken => (
  typeof value === 'object'
  && value !== null
  && typeof (value as ColorToken).$value === 'string'
  && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test((value as ColorToken).$value ?? '')
);

const expandHex = (hex: string) => {
  const value = hex.slice(1);
  return value.length === 3
    ? value.split('').map((character) => character.repeat(2)).join('')
    : value;
};

export const mixColor = (foregroundHex: string, backgroundHex: string, opacity: number) => {
  const foreground = expandHex(foregroundHex);
  const background = expandHex(backgroundHex);
  const channels = [0, 2, 4].map((offset) => {
    const foregroundChannel = Number.parseInt(foreground.slice(offset, offset + 2), 16);
    const backgroundChannel = Number.parseInt(background.slice(offset, offset + 2), 16);
    return Math.round((foregroundChannel * opacity) + (backgroundChannel * (1 - opacity)));
  });

  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
};

const getFigmaVariableName = (token: ColorToken) => {
  const figma = token.$extensions?.figma;
  if (typeof figma !== 'object' || figma === null) return undefined;
  const variableName = (figma as { variableName?: unknown }).variableName;
  return typeof variableName === 'string' ? variableName : undefined;
};

const createColorToken = (paletteName: string, stop: string, value: string): ColorToken => ({
  $type: 'color',
  $value: value,
  $extensions: {
    figma: {
      variableName: `${paletteName}/${stop}`,
      resolvedType: 'COLOR',
      scopes: ['ALL_SCOPES'],
    },
  },
});

const findBaseEntry = (palette: BrandPalette) => {
  const colorEntries = Object.entries(palette).filter((entry): entry is [string, ColorToken] => isColorToken(entry[1]));
  const stop500 = colorEntries.find(([stop]) => stop === '500');
  if (stop500) return { entry: stop500, isUnpositionedSingleColor: false };

  const metadata500 = colorEntries.find(([, token]) => /(?:^|\/)500$/i.test(getFigmaVariableName(token) ?? ''));
  if (metadata500) return { entry: metadata500, isUnpositionedSingleColor: colorEntries.length === 1 };

  if (colorEntries.length === 1) return { entry: colorEntries[0], isUnpositionedSingleColor: true };

  const closestNumericStop = colorEntries
    .filter(([stop]) => Number.isFinite(Number(stop)))
    .sort(([left], [right]) => Math.abs(Number(left) - 500) - Math.abs(Number(right) - 500))[0];

  return closestNumericStop
    ? { entry: closestNumericStop, isUnpositionedSingleColor: false }
    : undefined;
};

export const completeBrandPalette = (
  paletteName: string,
  palette: BrandPalette,
  brandName: string,
): BrandPalette => {
  if (PALETTE_STOPS.every((stop) => isColorToken(palette[stop]))) return palette;

  const base = findBaseEntry(palette);
  if (!base) {
    throw new Error(
      `A paleta "${paletteName}" da marca "${brandName}" precisa possuir ao menos uma cor hexadecimal válida.`,
    );
  }

  const [baseSourceStop, baseToken] = base.entry;
  const generated = PALETTE_STOPS.reduce<BrandPalette>((result, stop) => {
    const mix = STOP_MIXES[stop];
    const value = mix
      ? mixColor(baseToken.$value as string, mix.background, mix.opacity)
      : (baseToken.$value as string).toUpperCase();
    result[stop] = createColorToken(paletteName, stop, value);
    return result;
  }, {});

  // A lone colour always becomes the 500 base, even when an export placed it
  // under another stop. In a genuinely partial scale, explicit valid stops are
  // preserved and only the missing values are generated.
  if (base.isUnpositionedSingleColor) return generated;

  for (const stop of PALETTE_STOPS) {
    if (isColorToken(palette[stop]) && !(stop === baseSourceStop && baseSourceStop !== '500')) {
      generated[stop] = palette[stop];
    }
  }

  return generated;
};
