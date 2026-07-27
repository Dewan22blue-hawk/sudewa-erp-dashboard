const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // For min-h-[50vh] wrappers
  const pagePatterns = [
    /<div\s+className="flex min-h-\[50vh\] items-center justify-center[^"]*">\s*<Loader2[^>]*\/>\s*<\/div>/g,
    /<div\s+className="flex justify-center p-10">\s*<Loader2[^>]*\/>\s*<\/div>/g,
    /<div\s+className="flex h-\[50vh\] items-center justify-center">\s*<Loader2[^>]*\/>\s*<\/div>/g,
    /<div\s+className="flex items-center justify-center h-\[50vh\]">\s*<Loader2[^>]*\/>\s*<\/div>/g,
  ];

  let modified = false;

  for (const pattern of pagePatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '<LoadingState variant="page" />');
      modified = true;
    }
  }

  // Standalone large loaders in reports:
  // <Loader2 className="h-8 w-8 animate-spin text-gray-400" /> (if standalone, usually in a container)
  // Let's replace the one in laporan-transaksi-kas
  const standalonePageLoader = /<Loader2 className="h-8 w-8 animate-spin text-gray-[0-4]+00" \/>/g;
  if (standalonePageLoader.test(content)) {
    content = content.replace(standalonePageLoader, '<LoadingState variant="page" />');
    modified = true;
  }

  // For small inline loaders in tables/buttons
  const inlineLoaderPatterns = [
    /<Loader2 className="mr-2 h-4 w-4 animate-spin" \/>/g,
    /<Loader2 className="h-4 w-4 animate-spin" \/>/g,
    /<Loader2 className="h-4 w-4 animate-spin text-slate-400" \/>/g,
  ];
  
  for (const pattern of inlineLoaderPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '<LoadingState variant="inline" text={null} />');
      modified = true;
    }
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
