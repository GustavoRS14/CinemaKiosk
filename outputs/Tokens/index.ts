import coreData from './core/primitives.json';
import { activeBrand } from './activeBrand';
import semanticData from './system/semantics.json';
import responsiveData from './system/responsive.json';
import contextualData from './system/contextual.json';
import contextualHighContrastData from './system/contextual-high-contrast.json';
import typographyData from './system/typography.json';

// Aggregate the split files into a single token object
const tokens = {
  Primitive: coreData.Primitive,
  Brand: activeBrand,
  Semantic: semanticData.Semantic,
  Responsive: responsiveData.Responsive,
  Contextual: contextualData.Contextual,
  ContextualHighContrast: contextualHighContrastData.Contextual,
  Typography: typographyData.Typography,
  $extensions: {
    googleFonts: {
      cssImport: "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');"
    }
  }
};

export default tokens;
