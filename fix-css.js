const fs = require('fs');
const path = require('path');

const dir = './outputs';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.css') && f !== 'dark-theme.css');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all --[Uppercase] variables with lowercase equivalents
  content = content.replace(/--(Contextual|Semantic|Responsive|Primitive|Typography)[-A-Za-z0-9_]+/g, match => match.toLowerCase());
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
