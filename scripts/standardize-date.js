const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src/components', 'src/pages'];
const EXTENSIONS = ['.tsx', '.ts'];

const regexes = [
  /format\(([^,]+),\s*["']dd MMM yyyy["']\)/g,
  /format\(([^,]+),\s*["']PPP["']\)/g,
  /format\(([^,]+),\s*["']dd-MM-yyyy["']\)/g,
  /format\(([^,]+),\s*["']dd MMMM yyyy["']\)/g
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

  let hasChanges = false;
  
  // Custom case: formatLongDate or formatDate etc if they just wrap format
  // But we'll just replace the specific format() calls first
  for (const regex of regexes) {
      if (regex.test(content)) {
          content = content.replace(regex, 'formatDateUI($1)');
          hasChanges = true;
      }
  }
  
  // Custom fix for date-picker placeholder which might use format directly
  if (content.includes("formatDateUI(")) {
      if (!content.includes("import { formatDateUI }")) {
          // Find the last import line to append the new import
          const lines = content.split('\n');
          let lastImportIndex = -1;
          for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('import ')) {
                  lastImportIndex = i;
              }
          }
          if (lastImportIndex !== -1) {
              lines.splice(lastImportIndex + 1, 0, "import { formatDateUI } from '@/lib/utils/date';");
              content = lines.join('\n');
          } else {
              content = "import { formatDateUI } from '@/lib/utils/date';\n" + content;
          }
      }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated Date: ${filePath}`);
  }
}

DIRECTORIES.forEach(dir => {
  const fullPath = path.resolve(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});

console.log('Standarisasi Tanggal UI Selesai!');
