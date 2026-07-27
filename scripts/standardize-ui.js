const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src/pages', 'src/components', 'src/hooks'];
const EXTENSIONS = ['.tsx', '.ts'];

const perPageRegex = /useState\(\s*(5|10|15|20)\s*\)/g;
const selectItemRegex = /(<SelectContent>[\s\S]*?)<SelectItem[^>]*value="[^"]*"[^>]*>[^<]*<\/SelectItem>([\s\S]*?<\/SelectContent>)/g;

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

  // 1. Ganti default useState untuk perPage
  // Kami hanya mengganti jika line-nya terlihat seperti state pagination
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('useState(10)') || lines[i].includes('useState(5)') || lines[i].includes('useState(15)') || lines[i].includes('useState(20)')) {
      if (lines[i].toLowerCase().includes('page') || lines[i].toLowerCase().includes('limit')) {
        lines[i] = lines[i].replace(/useState\(\s*(5|10|15|20)\s*\)/, 'useState(25)');
      }
    }
  }
  content = lines.join('\n');

  // 2. Ganti opsi SelectItem dalam SelectContent pagination
  // Mencari blok <SelectContent> yang memiliki <SelectItem value="10"> dan menggantinya dengan 25, 50, 100
  // Untuk amannya, kita akan mencari line "SelectValue placeholder=" dan juga opsi <SelectItem> yang merupakan angka bulat (untuk show per page)

  // Custom approach for SelectItem pagination replacement
  // We'll use a simpler regex for lines that contain SelectItem with numeric values

  let newLines = [];
  let inPaginationSelect = false;
  let skipMode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we hit SelectValue placeholder for pagination
    if (line.includes('<SelectValue placeholder="10"') || line.includes('<SelectValue placeholder="5"')) {
      newLines.push(line.replace(/placeholder="(5|10|15|20)"/, 'placeholder="25"'));
      continue;
    }

    // Check if we are at SelectContent containing pagination options
    if (line.includes('<SelectItem value="5"') || line.includes('<SelectItem value="10"') || line.includes('<SelectItem value="15"') || line.includes('<SelectItem value="20"')) {
      // If we see this, we should replace it, but only once per group.
      // Let's check if it's just a raw number inside
      const match = line.match(/<SelectItem value="([^"]+)">([^<]+)<\/SelectItem>/);
      if (match) {
        const val = match[1];
        const text = match[2].trim();
        if ((val === text || text === val + ' data') && !isNaN(val)) {
          // It's a pagination item! We should skip these and output our standard instead
          // We'll replace the first one with our block, and skip subsequent ones until next non-SelectItem
          if (!skipMode) {
            const spaces = line.match(/^\s*/)[0];
            newLines.push(`${spaces}<SelectItem value="25">25</SelectItem>`);
            newLines.push(`${spaces}<SelectItem value="50">50</SelectItem>`);
            newLines.push(`${spaces}<SelectItem value="100">100</SelectItem>`);
            skipMode = true;
          }
          continue;
        }
      }
    } else {
      if (skipMode && line.includes('</SelectContent>')) {
        skipMode = false;
      } else if (skipMode && line.includes('<SelectItem')) {
        // Check if it's a numeric SelectItem, if so skip it
        const match = line.match(/<SelectItem value="([^"]+)">([^<]+)<\/SelectItem>/);
        if (match && !isNaN(match[1])) {
          continue;
        } else {
          skipMode = false;
        }
      } else {
        skipMode = false;
      }
    }

    if (!skipMode) {
      newLines.push(line);
    }
  }

  content = newLines.join('\n');

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