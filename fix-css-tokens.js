const fs = require('fs');
const path = require('path');

const IGNORED_COMPONENTS = [
  'Card_Option', 'DangerZoneFooter', 'DeviceStatusCard',
  'MetadataBar', 'FilterChip', 'Footer', 'Button', 'Toggle'
];

const TOKEN_MAP = {
  // Surfaces
  '--surface-secondary-default': '--Contextual-Surface-Secondary-Default',
  '--surface-primary-defaultPressed': '--Contextual-Surface-Primary-DefaultPressed',
  '--surface-primary-default': '--Contextual-Surface-Primary-Default',
  '--surface-tertiary-default': '--Contextual-Surface-Tertiary-Default',
  '--surface-closeButton-default-contained': '--Contextual-Surface-CloseButton-DefaultContained',
  '--surface-inverse-default': '--Contextual-Surface-Inverse-Default',
  '--surface-static-defaultPressed': '--Contextual-Surface-Static-DefaultPressed',
  '--surface-static-default': '--Contextual-Surface-Static-Default',
  '--surface-toggle-inactive-default': '--Contextual-Surface-Toggle-InactiveDefault',
  '--surface-toggle-inactive-pressed': '--Contextual-Surface-Toggle-InactivePressed',

  // Borders
  '--border-tertiary-default': '--Contextual-Border-Tertiary-Default',
  '--border-tertiary-pressed': '--Contextual-Border-Tertiary-Pressed',
  '--border-primary-default': '--Contextual-Border-Primary-Default',
  '--border-inverse-default': '--Contextual-Border-Inverse-Default',

  // Text
  '--text-default-body': '--Contextual-Text-Default-body',
  '--text-onColor-body': '--Contextual-Text-OnColor-body',
  '--text-default-caption-muted': '--Contextual-Text-Default-captionMuted',
  '--text-primary-default-pressed': '--Contextual-Text-Primary-defaultPressed',
  '--text-primary-default': '--Contextual-Text-Primary-default',

  // Icons
  '--icon-inverse-default': '--Contextual-Icon-Inverse-default',
  '--icon-primary-default': '--Contextual-Icon-Primary-default',
  '--icon-default-body': '--Contextual-Icon-Default-body',

  // Semantic (Radius & Width)
  '--border-radius-round': '--Semantic-BorderRadius-Round',
  '--border-radius-none': '--Semantic-BorderRadius-None',
  '--border-radius-50': '--Semantic-BorderRadius-50',
  '--border-radius-100': '--Semantic-BorderRadius-100',
  '--border-radius-200': '--Semantic-BorderRadius-200',
  '--border-radius-300': '--Semantic-BorderRadius-300',
  '--border-radius-400': '--Semantic-BorderRadius-400',
  '--border-width-25': '--Semantic-BorderWidth-25',
  '--border-width-50': '--Semantic-BorderWidth-50',
  '--border-width-100': '--Semantic-BorderWidth-100',

  // Responsive (Spacing)
  '--spacing-3xs': '--Responsive-Spacing-3xs',
  '--spacing-2xs': '--Responsive-Spacing-2xs',
  '--spacing-xs': '--Responsive-Spacing-xs',
  '--spacing-sm': '--Responsive-Spacing-sm',
  '--spacing-md': '--Responsive-Spacing-md',
  '--spacing-lg': '--Responsive-Spacing-lg',
  '--spacing-xl': '--Responsive-Spacing-xl',
  '--spacing-2xl': '--Responsive-Spacing-2xl',
  '--spacing-3xl': '--Responsive-Spacing-3xl',
  '--spacing-4xl': '--Responsive-Spacing-4xl',

  // Fonts
  '--font-primary': '--Semantic-Font-Primary',
  '--font-headings-h5-text-size': '--Responsive-Font-Headings-H5-TextSize',
  '--font-headings-h5-paragraph-spacing': '--Responsive-Font-Headings-H5-ParagraphSpacing',
  '--font-headings-h6-text-size': '--Responsive-Font-Headings-H6-TextSize',
  '--font-headings-h6-line-height': '--Responsive-Font-Headings-H6-LineHeight',
  '--font-headings-body-text-size': '--Responsive-Font-Headings-Body-TextSize',
  '--font-headings-body-line-height': '--Responsive-Font-Headings-Body-LineHeight'
};

function processFile(filePath) {
  if (!filePath.endsWith('.css')) return;

  const fileName = path.basename(filePath, '.css');
  if (IGNORED_COMPONENTS.some(ignored => filePath.includes(ignored))) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Purge manual dark mode definitions to enforce Blind Consumer Pattern
  content = content.replace(/(?:\[data-theme=['"]dark['"]\]|\.dark)\s*(?:\.|[^{])*\{[\s\S]*?\}/g, '');

  // 2. Exact token replacement maintaining the comma/fallback structure
  for (const [legacy, modern] of Object.entries(TOKEN_MAP)) {
     content = content.split(`var(${legacy}`).join(`var(${modern}`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`UPDATED: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        walkDir(fullPath);
      }
    } else {
      processFile(fullPath);
    }
  }
}

console.log('Starting mass token normalization...');
walkDir(path.join(__dirname));
console.log('Normalization complete!');
