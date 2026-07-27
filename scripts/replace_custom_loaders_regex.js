const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // This regex matches:
  // <div className="...text-center..." >Memuat ...</div>
  // <div className="...justify-center..." >Memuat ...</div>
  // It handles optional whitespace and inner spans.
  const regexes = [
    /<div[^>]*className="[^"]*text-center[^"]*"[^>]*>\s*(?:<span[^>]*>\s*)?(Memuat[^<]*|Loading[^<]*)(?:\s*<\/span>)?\s*<\/div>/gi,
    /<div[^>]*className="[^"]*justify-center[^"]*"[^>]*>\s*(?:<span[^>]*>\s*)?(Memuat[^<]*|Loading[^<]*)(?:\s*<\/span>)?\s*<\/div>/gi,
    /<div[^>]*className="[^"]*text-center[^"]*"[^>]*>\s*Loading\.\.\.\s*<\/div>/gi,
  ];

  let modified = false;

  for (const regex of regexes) {
    if (regex.test(content)) {
      content = content.replace(regex, '<LoadingState variant="page" />');
      modified = true;
    }
  }

  // Handle table cell loaders
  // <TableCell colSpan={...} className="h-28 text-center text-slate-500">Memuat detail item...</TableCell>
  const tableCellRegex = /<TableCell[^>]*colSpan=\{[^\}]*\}[^>]*text-center[^>]*>(Memuat[^<]*|Loading[^<]*)<\/TableCell>/gi;
  if (tableCellRegex.test(content)) {
    content = content.replace(tableCellRegex, '<TableCell colSpan={100} className="h-28 text-center"><LoadingState variant="section" text="$1" /></TableCell>');
    modified = true;
  }

  // Handle bare returns like return <DashboardLayout><div className="py-20 text-center text-sm text-slate-500">Memuat detail invoice...</div></DashboardLayout>;
  const bareDashboardLayoutRegex = /<DashboardLayout>\s*<LoadingState variant="page" \/>\s*<\/DashboardLayout>/g;
  if (bareDashboardLayoutRegex.test(content)) {
    // Make sure we have the import
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
walk(path.join(__dirname, '../src/components'));
