const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src/components/features -type f -name "*.tsx"').toString().trim().split('\n');

let modifiedCount = 0;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Pattern 1: Empty state text replacement
    // We look for cells that contain things like "Tidak ada data", "Belum ada data", etc.
    // MUST NOT cross closing tags!
    const emptyRegex = /<(td|TableCell)([^>]*?)>((?:(?!<\/(td|TableCell)>)[\s\S])*?(?:Tidak ada data|Belum ada data|Data tidak ditemukan|Belum ada)(?:(?!<\/(td|TableCell)>)[\s\S])*?)<\/(td|TableCell)>/gi;
    
    content = content.replace(emptyRegex, (match, openTag, attrs, inner, p4, p5, closeTag) => {
        // If it's just 'Belum ada Lunas' or something, skip.
        if (inner.includes('Belum Lunas') && !inner.includes('data')) return match;
        if (inner.includes('Tidak ada data ditemukan') && inner.includes('coba gunakan kata kunci')) return match;
        
        // Ensure not sticky for full span loading/empty
        let newAttrs = attrs.replace(/sticky right-0 bg-(white|\[#f8f9fa\]) z-10 border-l border-slate-200 shadow-\[-4px_0_6px_-4px_rgba\(0,0,0,0\.05\)\]/g, '');
        newAttrs = newAttrs.replace(/group-hover:bg-slate-50/g, '');
        
        if (!newAttrs.includes('py-')) newAttrs = newAttrs.replace(/className="/, 'className="py-16 ');
        else newAttrs = newAttrs.replace(/py-\d+/, 'py-16');
        if (!newAttrs.includes('colSpan=')) newAttrs += ' colSpan={100}';
        else newAttrs = newAttrs.replace(/colSpan=\{[^}]+\}/, 'colSpan={100}');
        
        return `<${openTag}${newAttrs}>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="rounded-full bg-slate-50 p-4 mb-2">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                        <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                    </div>
                </${closeTag}>`;
    });

    if (content !== originalContent) {
        if (!content.includes('Search') && content.includes('lucide-react')) {
            content = content.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { Search, $1 } from 'lucide-react';");
        } else if (!content.includes('lucide-react')) {
            content = `import { Search } from 'lucide-react';\n` + content;
        }

        fs.writeFileSync(file, content);
        modifiedCount++;
        console.log(`Modified empty state: ${file}`);
    }
});

console.log(`Modified empty states in ${modifiedCount} files.`);
