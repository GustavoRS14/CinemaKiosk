import type { CSSProperties } from 'react';

import primitiveData from '../../Tokens/core/primitives.json';
import { activeBrand } from '../../Tokens/activeBrand';
import onboardingData from '../../Tokens/onboarding/onboarding.json';
import semanticData from '../../Tokens/system/semantics.json';
import contextualData from '../../Tokens/system/contextual.json';

type TokenRecord = Record<string, unknown>;
type CssTokenStyles = CSSProperties & Record<string, string>;

const isToken = (value: unknown): value is { $value: unknown } =>
  Boolean(value && typeof value === 'object' && '$value' in (value as TokenRecord));

const brand = onboardingData.Brand as unknown as TokenRecord;
const palettes = (brand.Palettes ?? {}) as TokenRecord;
const paletteEntries = Object.entries(palettes);
const declaredPrimary = (
  (brand.$extensions as TokenRecord | undefined)?.brand as TokenRecord | undefined
)?.roles as TokenRecord | undefined;
const primaryPaletteName = paletteEntries.length === 1
  ? paletteEntries[0][0]
  : String(declaredPrimary?.primary ?? '');
const primaryPalette = palettes[primaryPaletteName] as TokenRecord | undefined;

if (!primaryPalette) {
  throw new Error(
    'O contrato de tokens do onboarding precisa declarar uma paleta Primary válida.',
  );
}

const tokenSources: TokenRecord = {
  Primitive: primitiveData.Primitive,
  Brand: {
    ...activeBrand,
    Primary: primaryPalette,
  },
  Semantic: semanticData.Semantic,
  Contextual: contextualData.Contextual.Light,
};

function tokenAt(path: string): unknown {
  let cursor: unknown = tokenSources;
  for (const segment of path.split('.')) {
    if (!cursor || typeof cursor !== 'object') return undefined;
    cursor = (cursor as TokenRecord)[segment];
  }
  return cursor;
}

function resolveValue(value: unknown, visited = new Set<string>()): string {
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    const reference = value.slice(1, -1);
    if (visited.has(reference)) throw new Error(`Referência circular de token: ${reference}`);
    const target = tokenAt(reference);
    if (!isToken(target)) throw new Error(`Token do onboarding não encontrado: ${reference}`);
    const nextVisited = new Set(visited);
    nextVisited.add(reference);
    return resolveValue(target.$value, nextVisited);
  }
  return String(value);
}

const styles: CssTokenStyles = {};
const semanticPrimary = semanticData.Semantic.Primary as unknown as TokenRecord;

for (const [stop, token] of Object.entries(semanticPrimary)) {
  if (isToken(token)) {
    styles[`--Semantic-Primary-${stop}`] = resolveValue(token.$value);
  }
}

function collectLightContextualTokens(node: unknown, path: string[]) {
  if (!node || typeof node !== 'object') return;
  if (isToken(node)) {
    styles[`--Contextual-${path.join('-')}`] = resolveValue(node.$value);
    return;
  }

  for (const [key, child] of Object.entries(node as TokenRecord)) {
    if (!key.startsWith('$')) collectLightContextualTokens(child, [...path, key]);
  }
}

collectLightContextualTokens(contextualData.Contextual.Light, []);

styles.colorScheme = 'light';

export const onboardingTokenStyles = Object.freeze(styles);
