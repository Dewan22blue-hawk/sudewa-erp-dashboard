const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Patterns to replace

  // 1. Table custom loaders
  // <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
  // <span className="text-sm font-medium text-slate-500">Memuat data...</span>
  // We will replace the whole wrapper if we can match it:
  const tableLoaderPattern = /<div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">\s*<Loader2 className="h-6 w-6 animate-spin text-indigo-500" \/>\s*<span className="text-sm font-medium text-slate-500">Memuat data\.\.\.<\/span>\s*<\/div>/g;

  // Or generic table loaders
  const genericTableLoaderPattern = /<Loader2 className="h-6 w-6 animate-spin text-indigo-500" \/>/g;

  // 2. Button inline loaders
  const buttonLoaderPatterns = [
    /<Loader2 className="mr-2 h-4 w-4 animate-spin" \/>/g,
    /<Loader2 className="h-4 w-4 animate-spin mr-2" \/>/g,
    /<Loader2 className="h-4 w-4 animate-spin text-indigo-500" \/>/g,
    /<Loader2 className="h-4 w-4 animate-spin" \/>/g, // generic small loader
  ];

  // 3. Page big loaders
  const pageLoaderPatterns = [
    /<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" \/>/g,
  ];

  let modified = false;

  if (tableLoaderPattern.test(content)) {
    content = content.replace(tableLoaderPattern, '<LoadingState variant="section" text="Memuat data..." />');
    modified = true;
  }

  if (genericTableLoaderPattern.test(content)) {
    content = content.replace(genericTableLoaderPattern, '<LoadingState variant="section" text={null} />');
    modified = true;
  }

  for (const pattern of buttonLoaderPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '<LoadingState variant="inline" text={null} />');
      modified = true;
    }
  }

  for (const pattern of pageLoaderPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '<LoadingState variant="page" />');
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

    // Attempt to remove Loader2 import
    const loader2Count = (content.match(/Loader2/g) || []).length;
    if (loader2Count === 1) { // Only the import remains
      content = content.replace(/,\s*Loader2/, '');
      content = content.replace(/Loader2\s*,/, '');
      content = content.replace(/import\s*{\s*Loader2\s*}\s*from\s*'lucide-react';?\n/, '');
    }

    fs.writeFileSync(filePath, content, 'utf8');
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

walk(path.join(__dirname, '../src/components'));
