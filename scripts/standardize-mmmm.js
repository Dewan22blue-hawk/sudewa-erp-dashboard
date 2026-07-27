const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src/components', 'src/pages', 'src/lib', 'src/utils', 'src/hooks'];
const EXTENSIONS = ['.tsx', '.ts'];

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

  // Replace 'dd MMM yyyy' and "dd MMM yyyy" with 'dd MMMM yyyy'
  if (content.includes('dd MMM yyyy')) {
    content = content.replace(/dd MMM yyyy/g, 'dd MMMM yyyy');
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
