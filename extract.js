const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./outputs/tokens.json', 'utf8'));

function resolveAlias(alias) {
  if (alias.startsWith('{') && alias.endsWith('}')) {
    const path = alias.slice(1, -1).split('.');
    let cursor = data;
    for (const p of path) {
      cursor = cursor[p];
    }
    if (cursor.$value) return resolveAlias(cursor.$value);
    return cursor;
  }
  return alias;
}

function traverse(obj, path = []) {
  if (!obj || typeof obj !== 'object') return;
  if (obj.$value) {
    console.log(`--${path.join('-').toLowerCase()}: ${resolveAlias(obj.$value)};`);
    return;
  }
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue;
    traverse(obj[key], [...path, key]);
  }
}

console.log("DARK:");
traverse(data.Contextual.Dark);

console.log("\nLIGHT:");
traverse(data.Contextual.Light);
