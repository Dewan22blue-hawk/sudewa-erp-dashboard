const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src/pages', 'src/components', 'src/hooks', 'src/services'];
const EXTENSIONS = ['.tsx', '.ts'];

const regexes = [
  // useQueryParamsTable
  { pattern: /defaultPerPage:\s*(5|10|15|20|50|100)\b/g, replacement: 'defaultPerPage: 25' },
  // useState variants for numbers
  { pattern: /useState(?:<number>)?\(\s*(5|10|15|20|50|100)\s*\)/g, replacement: 'useState(25)' },
  // useState variants for strings
  { pattern: /useState(?:<string>)?\(\s*['"](5|10|15|20|50|100)['"]\s*\)/g, replacement: "useState('25')" },
  // SelectValue placeholder in UI (only if it matches these exact strings for pagination)
  { pattern: /<SelectValue\s+placeholder=["'](5|10|15|20|50|100)(?:\s+data)?["']\s*\/>/g, replacement: '<SelectValue placeholder="25" />' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We should be careful not to replace `useState(50)` if it's NOT a pagination related state.
  // But since the project is primarily a dashboard and 50/100 state defaults are overwhelmingly used for `limit` / `perPage`, we will do a conditional check or just use regex with variable names.
  
  // Custom regex to target only pagination-related state variable names
  const stateRegex = /const\s+\[\s*([a-zA-Z0-9_]*(?:PerPage|Limit|PageSize)[a-zA-Z0-9_]*)\s*,\s*set[a-zA-Z0-9_]*\s*\]\s*=\s*useState(?:<[^>]+>)?\(\s*(?:['"]?)(\d+)(?:['"]?)\s*\)/ig;
  
  content = content.replace(stateRegex, (match, varName, value) => {
      const num = parseInt(value, 10);
      if ([5, 10, 15, 20, 50, 100].includes(num)) {
          // preserve quotes if original had quotes
          if (match.includes(`'${value}'`) || match.includes(`"${value}"`)) {
             return match.replace(/['"]\d+['"]/, "'25'");
          }
          return match.replace(/\(\s*\d+\s*\)/, '(25)');
      }
      return match;
  });

  // Also replace defaultPerPage: 50
  content = content.replace(/defaultPerPage:\s*(5|10|15|20|50|100)\b/g, 'defaultPerPage: 25');
  
  // Also replace limit/perPage in class or obj where it's 10, 50 or 100. Actually, ONLY in hooks or contexts where we know it's a default, not an API fetch for "all data" (100).
  // I will skip arbitrary perPage: 100 for now, because it could break combobox fetches.
  
  // Replace SelectValue placeholder
  content = content.replace(/<SelectValue\s+placeholder=["'](5|10|15|20|50|100)(?:\s+data)?["']\s*\/>/g, '<SelectValue placeholder="25" />');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated to 25: ${filePath}`);
  }
}

DIRECTORIES.forEach(dir => {
  const fullPath = path.resolve(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});

console.log('Perbaikan perPage/limit 25 secara menyeluruh Selesai!');
