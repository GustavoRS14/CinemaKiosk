const fs = require('fs');
const path = require('path');

const root = __dirname;
const outDir = path.resolve(root, '..', 'outputs');
const read = name => JSON.parse(fs.readFileSync(path.join(root, `extract_${name}.json`), 'utf8'));

const primitive = read('primitive');
const semantic = read('semantic');
const responsive = read('responsive');
const contextualParts = ['contextual_surface','contextual_text','contextual_icon','contextual_border','contextual_shadow_brand'].map(read);
const typography = ['typography_headings_a','typography_headings_b','typography_body','typography_captions'].flatMap(name => read(name));

const typeMap = { COLOR: 'color', STRING: 'string', BOOLEAN: 'boolean' };
const isNumberToken = variable => variable.type === 'FLOAT' && (variable.scopes || []).includes('OPACITY');
const tokenType = variable => typeMap[variable.type] || (isNumberToken(variable) ? 'number' : 'dimension');
const ref = value => `{${value.collection}.${value.name.split('/').join('.')}}`;
const scalar = (value, variable) => {
  if (value && value.alias) return ref(value);
  if (variable.type === 'FLOAT' && !isNumberToken(variable)) return { value, unit: 'px' };
  return value;
};
const put = (rootObject, slashName, token) => {
  const parts = slashName.split('/');
  let cursor = rootObject;
  for (const part of parts.slice(0, -1)) cursor = cursor[part] ||= {};
  cursor[parts.at(-1)] = token;
};
const figmaMeta = variable => ({
  variableName: variable.name,
  resolvedType: variable.type,
  scopes: variable.scopes || [],
  ...(variable.description ? { description: variable.description } : {})
});
const singleModeCollection = (source, filter = () => true) => {
  const tokens = {};
  const mode = source.collection.defaultMode || source.collection.modes[0];
  for (const variable of source.variables.filter(filter)) {
    put(tokens, variable.name, {
      $type: tokenType(variable),
      $value: scalar(variable.values[mode], variable),
      $extensions: { figma: figmaMeta(variable) }
    });
  }
  return {
    $extensions: { figma: { collectionName: source.collection.name, modes: source.collection.modes, defaultMode: mode } },
    ...tokens
  };
};
const multiModeCollection = source => {
  const result = { $extensions: { figma: { collectionName: source.collection.name, modes: source.collection.modes, defaultMode: source.collection.defaultMode } } };
  for (const mode of source.collection.modes) {
    const tree = {};
    for (const variable of source.variables) {
      put(tree, variable.name, {
        $type: tokenType(variable),
        $value: scalar(variable.values[mode], variable),
        $extensions: { figma: figmaMeta(variable) }
      });
    }
    result[mode] = tree;
  }
  return result;
};

const contextual = { ...contextualParts[0], variables: contextualParts.flatMap(x => x.variables) };
const semanticAliasViolations = [];
const contextualAliasViolations = [];
const responsiveAliasViolations = [];
for (const variable of semantic.variables) for (const [mode, value] of Object.entries(variable.values)) if (value?.alias && value.collection !== 'Primitive') semanticAliasViolations.push({ token: variable.name, mode, actualTarget: `${value.collection}.${value.name}`, expectedTier: 'Primitive' });
for (const variable of contextual.variables) for (const [mode, value] of Object.entries(variable.values)) if (value?.alias && value.collection !== 'Semantic') contextualAliasViolations.push({ token: variable.name, mode, actualTarget: `${value.collection}.${value.name}`, expectedTier: 'Semantic' });
for (const variable of responsive.variables) for (const [mode, value] of Object.entries(variable.values)) if (value?.alias && !['Primitive', 'Responsive'].includes(value.collection)) responsiveAliasViolations.push({ token: variable.name, mode, actualTarget: `${value.collection}.${value.name}`, expectedTier: 'Primitive, Responsive, or standalone value' });
const weightMap = { Thin: 100, ExtraLight: 200, 'Extra Light': 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Semibold: 600, 'Semi Bold': 600, Bold: 700, ExtraBold: 800, Extrabold: 800, 'Extra Bold': 800, Black: 900 };
const typographyTree = {};
for (const style of typography) {
  const [, role, variant] = style.name.split('/');
  const b = style.bindings || {};
  const aliasOr = (field, fallback) => b[field] ? ref(b[field]) : fallback;
  put(typographyTree, `${role}/${variant}`, {
    $type: 'typography',
    $value: {
      fontFamily: aliasOr('fontFamily', style.fontFamily),
      fontWeight: weightMap[style.fontStyle] ?? weightMap[variant],
      fontSize: aliasOr('fontSize', null),
      lineHeight: aliasOr('lineHeight', style.lineHeight),
      letterSpacing: aliasOr('letterSpacing', style.letterSpacing),
      paragraphSpacing: aliasOr('paragraphSpacing', null),
      textCase: style.textCase,
      textDecoration: style.textDecoration
    },
    $extensions: {
      figma: {
        textStyleName: style.name,
        fontStyleName: style.fontStyle,
        bindings: style.bindings
      }
    }
  });
}

const doc = {
  $schema: 'https://design-tokens.github.io/community-group/format/',
  $description: 'Totem ATM design tokens exported from Figma with direct aliases preserved. Responsive modes correspond to kiosk orientation; Contextual modes support Light and Dark themes.',
  $extensions: {
    source: {
      platform: 'Figma',
      fileKey: 'Dc6wSUldS37E5mvi3MaJMa',
      nodeId: '129:319',
      extractedAt: '2026-09-10'
    },
    target: { device: 'Self-Service Kiosk (Totem)', os: 'Windows', interaction: 'touch' },
    googleFonts: {
      family: 'Poppins',
      weights: [300, 400, 500, 600, 700, 800],
      cssImport: "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');"
    },
    fontWeightMap: { Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800 }
    ,validation: {
      strictAliasing: {
        semanticToPrimitive: { status: semanticAliasViolations.length ? 'source-exceptions' : 'pass', exceptions: semanticAliasViolations },
        contextualToSemantic: { status: contextualAliasViolations.length ? 'source-exceptions' : 'pass', exceptions: contextualAliasViolations },
        responsiveAliases: { status: responsiveAliasViolations.length ? 'source-exceptions' : 'pass', exceptions: responsiveAliasViolations }
      },
      exclusions: ['Documentation collection', 'Primitive/Documentation group']
    }
  },
  Primitive: singleModeCollection(primitive, variable => !variable.name.startsWith('Documentation/')),
  Semantic: singleModeCollection(semantic),
  Responsive: multiModeCollection(responsive),
  Contextual: multiModeCollection(contextual),
  Typography: {
    Semantic: {
      'Primária': typographyTree
    }
  }
};

fs.mkdirSync(outDir, { recursive: true });
const outputPath = path.join(outDir, 'tokens.json');
fs.writeFileSync(outputPath, JSON.stringify(doc, null, 2) + '\n');

const walkTokens = (node, prefix = [], out = []) => {
  if (node && typeof node === 'object') {
    if ('$value' in node) out.push({ path: prefix.join('.'), token: node });
    else for (const [key, value] of Object.entries(node)) if (!key.startsWith('$')) walkTokens(value, [...prefix, key], out);
  }
  return out;
};
const all = walkTokens(doc);
const aliasStrings = [];
const collectAliases = value => {
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) aliasStrings.push(value.slice(1, -1));
  else if (value && typeof value === 'object') Object.values(value).forEach(collectAliases);
};
all.forEach(x => collectAliases(x.token.$value));
const rawSemantic = semantic.variables.filter(v => Object.values(v.values).some(x => !x?.alias)).map(v => v.name);
const rawContextual = contextual.variables.filter(v => Object.values(v.values).some(x => !x?.alias)).map(v => v.name);
const responsiveRaw = responsive.variables.filter(v => Object.values(v.values).some(x => !x?.alias)).map(v => v.name);
const counts = {
  Primitive: primitive.variables.filter(v => !v.name.startsWith('Documentation/')).length,
  Semantic: semantic.variables.length,
  Responsive: responsive.variables.length,
  Contextual: contextual.variables.length,
  Typography: typography.length
};
console.log(JSON.stringify({ outputPath, counts, aliases: aliasStrings.length, semanticAliasViolations, contextualAliasViolations, responsiveAliasViolations, rawSemantic, rawContextual, responsiveRaw }, null, 2));
