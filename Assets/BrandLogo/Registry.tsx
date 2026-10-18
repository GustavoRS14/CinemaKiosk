/* CRITICAL FIX: Expanded glob to include raster image formats */
const mediaModules = import.meta.glob(
  './*/*.{svg,png,jpg,jpeg,jfif,webp,avif,gif,bmp,ico,tif,tiff}',
  { eager: true, query: '?url', import: 'default' },
);
const svgSourceModules = import.meta.glob<string>('./*/*.svg', { eager: true, query: '?raw', import: 'default' });

const getBaseFileName = (type: 'Standard' | 'Fidelity', format: 'Full' | 'Compact') => (
  type === 'Fidelity' && format === 'Compact'
    ? 'Fidelity_Full'
    : `${type}_${format}`
);

const findBrandModule = <T,>(
  modules: Record<string, T>,
  tenant: string,
  type: 'Standard' | 'Fidelity',
  format: 'Full' | 'Compact',
) => {
  if (!tenant) return null;
  const safeTenant = tenant.toLowerCase();
  const baseFileName = getBaseFileName(type, format);

  for (const [path, module] of Object.entries(modules)) {
    const parts = path.split('/');
    if (parts.length !== 3) continue;
    const folderName = parts[1].toLowerCase();
    const fileNameWithoutExt = parts[2].split('.')[0];
    if (folderName === safeTenant && fileNameWithoutExt === baseFileName) return module;
  }
  return null;
};

const findBrandModuleByName = <T,>(
  modules: Record<string, T>,
  tenant: string,
  fileName: string,
) => {
  if (!tenant) return null;
  const safeTenant = tenant.toLowerCase();
  const safeFileName = fileName.toLowerCase();

  for (const [path, module] of Object.entries(modules)) {
    const parts = path.split('/');
    if (parts.length !== 3) continue;
    const folderName = parts[1].toLowerCase();
    const fileNameWithoutExt = parts[2].replace(/\.[^.]+$/, '').toLowerCase();
    if (folderName === safeTenant && fileNameWithoutExt === safeFileName) return module;
  }
  return null;
};

export const getBrandAsset = (tenant: string, type: 'Standard' | 'Fidelity', format: 'Full' | 'Compact'): string | null => {
  return findBrandModule(mediaModules as Record<string, string>, tenant, type, format);
};

export const getBrandSvgSource = (
  tenant: string,
  type: 'Standard' | 'Fidelity',
  format: 'Full' | 'Compact',
) => findBrandModule(svgSourceModules, tenant, type, format);

export const getBrandAssetByName = (tenant: string, fileName: string): string | null => (
  findBrandModuleByName(mediaModules as Record<string, string>, tenant, fileName)
);

export const getBrandSvgSourceByName = (tenant: string, fileName: string): string | null => (
  findBrandModuleByName(svgSourceModules, tenant, fileName)
);
