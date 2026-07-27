const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const replacePatterns = [
    // Pattern: <div className="p-8 text-center text-gray-500 bg-white rounded-md border border-gray-100">Loading...</div>
    /<div className="p-8 text-center text-gray-500 bg-white rounded-md border border-gray-100">Loading\.\.\.<\/div>/g,
    // Pattern: <div className="text-center text-slate-500">Memuat data...</div>
    /<div className="text-center text-slate-500">Memuat data\.\.\.<\/div>/g,
    // Pattern: <div className="flex justify-center p-10"><span className="text-slate-500">Memuat data...</span></div>
    /<div className="flex justify-center p-10"><span className="text-slate-500">Memuat data\.\.\.<\/span><\/div>/g,
    // Pattern: <div className="text-center py-4">Memuat data...</div>
    /<div className="text-center py-4">Memuat data\.\.\.<\/div>/g,
    // Pattern: <div className="text-center text-muted-foreground">Memuat data...</div>
    /<div className="text-center text-muted-foreground">Memuat data\.\.\.<\/div>/g,
    // Pattern: <div className="p-8 text-center text-gray-500">Loading...</div>
    /<div className="p-8 text-center text-gray-500">Loading\.\.\.<\/div>/g,
    // Pattern: <div className="text-center text-slate-500 py-10">Memuat data...</div>
    /<div className="text-center text-slate-500 py-10">Memuat data\.\.\.<\/div>/g,
    // Add variations if needed.
  ];

  let modified = false;

  for (const pattern of replacePatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '<LoadingState variant="page" />');
      modified = true;
    }
  }

  // Also replace any <Card className="rounded-md p-6"><LoadingState variant="page" /></Card> with just <LoadingState variant="page" /> if it looks weird, but let's just leave the card or let it be.
  
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
