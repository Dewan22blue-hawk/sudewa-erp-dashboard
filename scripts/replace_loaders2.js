const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Pattern 1: Nested loader with text
  // <div className="flex min-h-[50vh] items-center justify-center rounded-md border bg-white">
  //     <div className="flex items-center gap-3 text-gray-500">
  //         <Loader2 className="h-5 w-5 animate-spin" />
  //         Memuat detail...
  //     </div>
  // </div>
  const nestedLoaderPattern = /<div className="flex min-h-\[50vh\] items-center justify-center[^>]*>\s*<div className="flex items-center gap-3 text-gray-500">\s*<Loader2 className="h-5 w-5 animate-spin" \/>\s*(Memuat[^<]*)\s*<\/div>\s*<\/div>/g;

  // Pattern 2: Standalone loading text in reports (h-8 w-8)
  const reportLoaderPattern = /<Loader2 className="h-8 w-8 animate-spin text-gray-400" \/>/g;

  // Pattern 3: administrasi/bukti-potong/[id]/index.tsx
  const buktiPotongPattern = /<div className="flex min-h-\[50vh\] items-center justify-center rounded-md border border-slate-200 bg-white">\s*<div className="flex flex-col items-center gap-3 text-slate-500">\s*<Loader2 className="h-5 w-5 animate-spin" \/>\s*(<p>)?Memuat data(.*?)<\/div>\s*<\/div>/gs;

  let modified = false;

  if (nestedLoaderPattern.test(content)) {
    content = content.replace(nestedLoaderPattern, (match, p1) => {
      return `<LoadingState variant="page" text="${p1.trim()}" />`;
    });
    modified = true;
  }

  if (reportLoaderPattern.test(content)) {
    content = content.replace(reportLoaderPattern, '<LoadingState variant="page" />');
    modified = true;
  }

  if (buktiPotongPattern.test(content)) {
    content = content.replace(buktiPotongPattern, '<LoadingState variant="page" />');
    modified = true;
  }

  if (modified) {
    if (!content.includes('import { LoadingState }')) {
      const importMatches = [...content.matchAll(/^import .* from '.*';?$/gm)];
      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const insertPos = lastImport.index + lastImport[0].length;
        content = content.slice(0, insertPos) + "\nimport { LoadingState } from '@/components/ui/loading-state';" + content.slice(insertPos);
      } else {
        content = "import { LoadingState } from '@/components/ui/loading-state';\n" + content;
      }
    }

    const loader2Count = (content.match(/Loader2/g) || []).length;
    if (loader2Count === 1) { // Only the import remains
      content = content.replace(/,\s*Loader2/, '');
      content = content.replace(/Loader2\s*,/, '');
      content = content.replace(/import\s*{\s*Loader2\s*}\s*from\s*'lucide-react';?\n/, '');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, '../src/pages/dashboard'));
