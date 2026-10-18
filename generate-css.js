const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./outputs/tokens.json', 'utf8'));

function resolveAlias(alias) {
  if (alias.startsWith('{') && alias.endsWith('}')) {
    const path = alias.slice(1, -1).split('.');
    let cursor = data;
    for (const p of path) {
      if (!cursor) return alias;
      cursor = cursor[p];
    }
    if (cursor && cursor.$value) return resolveAlias(cursor.$value);
    return cursor;
  }
  return alias;
}

function traverse(obj, path = [], result = []) {
  if (!obj || typeof obj !== 'object') return result;
  if (obj.$value) {
    const cssVarName = `--${path.join('-').replace(/\s+/g, '-').toLowerCase()}`;
    result.push(`${cssVarName}: ${resolveAlias(obj.$value)};`);
    return result;
  }
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue;
    traverse(obj[key], [...path, key], result);
  }
  return result;
}

const darkTokens = traverse(data.Contextual.Dark);

const cssContent = `
/* Auto-generated Dark Theme Overrides */
[data-theme="dark"],
.dark {
  ${darkTokens.join('\n  ')}
}
`;

fs.writeFileSync('./outputs/dark-theme.css', cssContent);
console.log("Generated dark-theme.css");
