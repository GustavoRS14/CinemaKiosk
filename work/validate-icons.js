const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '..', 'outputs', 'assets');
const plan = require('./icon-export-plan.json').plan;
const filenameRefinements = {
  'b-r-flag.svg': 'br-flag.svg',
  'e-s-flag.svg': 'es-flag.svg',
  'u-s-flag.svg': 'us-flag.svg',
  'p-i-x.svg': 'pix.svg',
  'i-d.svg': 'id.svg',
  't-e-f.svg': 'tef.svg',
  'h-r.svg': 'hr.svg',
  'i-t.svg': 'it.svg',
};
const expected = new Set(plan.map((item) => filenameRefinements[item.file] || item.file));
const files = fs.readdirSync(target).filter((file) => file.endsWith('.svg')).sort();
const hardColor = /\b(?:fill|stroke)=["'](#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|black|white)["']/gi;
const report = [];

for (const file of files) {
  const svg = fs.readFileSync(path.join(target, file), 'utf8');
  const colors = [...svg.matchAll(hardColor)].map((match) => match[1].toLowerCase());
  report.push({
    file,
    hasViewBox: /\bviewBox=["'][^"']+["']/i.test(svg),
    hasEmptyGroup: /<g\b[^>]*>\s*<\/g>/i.test(svg),
    hardColors: [...new Set(colors)],
  });
}

const exported = report.filter((item) => item.file !== 'add-plus.svg');
const validation = {
  expectedExports: expected.size,
  exportedFiles: exported.length,
  targetSvgFiles: files.length,
  missing: [...expected].filter((file) => !files.includes(file)).sort(),
  unexpected: files.filter((file) => file !== 'add-plus.svg' && !expected.has(file)),
  invalidNames: files.filter((file) => !/^[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/.test(file)),
  missingViewBox: exported.filter((item) => !item.hasViewBox).map((item) => item.file),
  emptyGroups: exported.filter((item) => item.hasEmptyGroup).map((item) => item.file),
  monochromeHardcoded: exported
    .filter((item) => item.hardColors.length === 1)
    .map((item) => ({ file: item.file, colors: item.hardColors })),
  multicolor: exported
    .filter((item) => item.hardColors.length > 1)
    .map((item) => ({ file: item.file, colors: item.hardColors })),
  addPlusPresent: files.includes('add-plus.svg'),
  addPlusWasExported: expected.has('add-plus.svg'),
};

console.log(JSON.stringify(validation, null, 2));
