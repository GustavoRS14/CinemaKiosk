/// <reference types="vite/client" />

import brandConfig from './brand.config.json';
import { completeBrandPalette, type BrandPalette } from './brandPalette';

type BrandTokenFile = {
  Brand: {
    $extensions?: {
      brand?: {
        name?: string;
        roles?: Record<string, string>;
      };
    };
    Palettes?: Record<string, BrandPalette>;
  };
};

const brandModules = import.meta.glob<{ default: BrandTokenFile }>(
  './brands/*/*.json',
  { eager: true },
);
const activeBrandPath = `./brands/${brandConfig.activeBrand}/${brandConfig.activeBrand}.json`;
const activeBrandData = brandModules[activeBrandPath]?.default;

if (!activeBrandData?.Brand) {
  throw new Error(
    `A marca "${brandConfig.activeBrand}" não foi encontrada em ${activeBrandPath} ou não expõe o contrato Brand.`,
  );
}

const normalizeKey = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/gi, '')
  .toLowerCase();

const findPaletteByName = (palettes: Record<string, BrandPalette>, requestedName?: string) => {
  if (!requestedName) return undefined;
  const requestedKey = normalizeKey(requestedName);
  return Object.keys(palettes).find((name) => normalizeKey(name) === requestedKey);
};

const matchesRoleAlias = (value: string, aliases: readonly string[]) => {
  const normalizedValue = normalizeKey(value);
  return aliases.some((alias) => (
    normalizedValue === alias
    || normalizedValue.startsWith(alias)
    || normalizedValue.endsWith(alias)
  ));
};

const getAssignedPaletteName = (
  roles: Record<string, string> | undefined,
  roleAliases: readonly string[],
  palettes: Record<string, BrandPalette>,
) => {
  const aliases = roleAliases.map(normalizeKey);
  const assignment = Object.entries(roles ?? {}).find(([role]) => matchesRoleAlias(role, aliases))?.[1];
  return findPaletteByName(palettes, assignment);
};

const getNamedRolePalette = (
  palettes: Record<string, BrandPalette>,
  roleAliases: readonly string[],
) => {
  const aliases = roleAliases.map(normalizeKey);
  return Object.keys(palettes).find((name) => matchesRoleAlias(name, aliases));
};

const normalizeBrand = (brandDefinition: BrandTokenFile['Brand'], brandName: string) => {
  const roleAssignments = brandDefinition.$extensions?.brand?.roles;
  const palettes = brandDefinition.Palettes ?? {};
  const paletteNames = Object.keys(palettes);

  if (paletteNames.length === 0) {
    throw new Error(`A marca "${brandName}" precisa declarar ao menos uma cor em Brand.Palettes.`);
  }

  const primaryAliases = ['primary', 'primaria', 'primario'];
  const secondaryAliases = ['secondary', 'secundaria', 'secundario'];
  const assignedPrimary = getAssignedPaletteName(roleAssignments, primaryAliases, palettes);
  const assignedSecondary = getAssignedPaletteName(roleAssignments, secondaryAliases, palettes);
  const namedPrimary = getNamedRolePalette(palettes, primaryAliases);
  const namedSecondary = getNamedRolePalette(palettes, secondaryAliases);

  const primaryName = assignedPrimary
    ?? namedPrimary
    ?? paletteNames.find((name) => name !== (assignedSecondary ?? namedSecondary))
    ?? paletteNames[0];
  const secondaryName = assignedSecondary
    ?? namedSecondary
    ?? paletteNames.find((name) => name !== primaryName)
    ?? primaryName;

  return {
    $extensions: brandDefinition.$extensions,
    Primary: completeBrandPalette(primaryName, palettes[primaryName], brandName),
    Secondary: completeBrandPalette(secondaryName, palettes[secondaryName], brandName),
  };
};

// Normalize arbitrary names and incomplete company palettes into the stable
// roles and complete 100 Scale consumed by the semantic tokens.
export const activeBrand = normalizeBrand(activeBrandData.Brand, brandConfig.activeBrand);

const brandsByTenant = Object.entries(brandModules).reduce<Record<string, typeof activeBrand>>(
  (result, [path, module]) => {
    if (!module.default?.Brand) return result;
    const folderName = path.split('/')[2] ?? '';
    const declaredName = module.default.Brand.$extensions?.brand?.name ?? folderName;
    const normalizedBrand = normalizeBrand(module.default.Brand, declaredName);
    result[normalizeKey(folderName)] = normalizedBrand;
    result[normalizeKey(declaredName)] = normalizedBrand;
    return result;
  },
  {},
);

const paletteCountsByTenant = Object.entries(brandModules).reduce<Record<string, number>>(
  (result, [path, module]) => {
    if (!module.default?.Brand) return result;
    const folderName = path.split('/')[2] ?? '';
    const declaredName = module.default.Brand.$extensions?.brand?.name ?? folderName;
    const paletteCount = Object.keys(module.default.Brand.Palettes ?? {}).length;
    result[normalizeKey(folderName)] = paletteCount;
    result[normalizeKey(declaredName)] = paletteCount;
    return result;
  },
  {},
);

const activeBrandPaletteCount = Object.keys(activeBrandData.Brand.Palettes ?? {}).length;

export function getBrandForTenant(tenant?: string) {
  return tenant ? brandsByTenant[normalizeKey(tenant)] ?? activeBrand : activeBrand;
}

export function getBrandPaletteCountForTenant(tenant?: string) {
  return tenant ? paletteCountsByTenant[normalizeKey(tenant)] ?? activeBrandPaletteCount : activeBrandPaletteCount;
}
