const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src/pages', 'src/components', 'src/hooks', 'src/services'];
const EXTENSIONS = ['.tsx', '.ts'];

const regexes = [
  // useQueryParamsTable
  { pattern: /defaultPerPage:\s*10\b/g, replacement: 'defaultPerPage: 25' },
  // useState variants
  { pattern: /useState<number>\(\s*10\s*\)/g, replacement: 'useState<number>(25)' },
  { pattern: /useState\(\s*['"]10['"]\s*\)/g, replacement: "useState('25')" },
  // perPage object props
  { pattern: /perPage:\s*10\b/g, replacement: 'perPage: 25' },
  { pattern: /per_page:\s*10\b/g, replacement: 'per_page: 25' },
  // limit assignments
  { pattern: /limit\s*=\s*10\b/g, replacement: 'limit = 25' },
  // itemsPerPage assignments
  { pattern: /itemsPerPage\s*=\s*10\b/g, replacement: 'itemsPerPage = 25' }
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

  for (const { pattern, replacement } of regexes) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

DIRECTORIES.forEach(dir => {
  const fullPath = path.resolve(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});