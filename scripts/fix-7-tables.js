const fs = require('fs');

const files = [
    'src/components/features/finance/uj-driver/UJDriverTable.tsx',
    'src/components/features/finance/withholding-tax/WithholdingTaxTable.tsx',
    'src/components/features/kas-harian/KasHarianTable.tsx',
    'src/components/features/laporan-warehouse/OutstandingTable.tsx',
    'src/components/features/ppn-pembelian/PPNPembelianTable.tsx',
    'src/components/features/ppn-penjualan/PPNPenjualanTable.tsx',
    'src/components/features/tagihan-bbn/BBNBillPrintDocument.tsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Add imports
    if (!content.includes('Loader2') || !content.includes('Search')) {
        const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
        if (importMatch) {
            let imports = importMatch[1].split(',').map(s => s.trim()).filter(s => s);
            if (!imports.includes('Loader2')) imports.push('Loader2');
            if (!imports.includes('Search')) imports.push('Search');
            content = content.replace(importMatch[0], `import { ${imports.join(', ')} } from 'lucide-react'`);
        } else {
            content = content.replace(/^(import.*)$/m, `$1\nimport { Loader2, Search } from 'lucide-react';`);
        }
    }

    // Replace Loading (Array.from... map...)
    const loadingBlock = /isLoading \? \([\s\S]*?Array\.from\(\{ length: \d+ \}\)\.map\(\([^)]+\) => <SkeletonRow[^>]*>\)[\s\S]*?\) :/g;
    
    content = content.replace(loadingBlock, `isLoading ? (
              <tr>
                <td colSpan={100} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="text-sm font-medium text-slate-500">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) :`);
            
    const emptyBlock = /(!hasData|data\.length === 0) \? \([\s\S]*?<tr>[\s\S]*?<td[^>]*>[\s\S]*?(?:Belum ada data|Tidak ada data)[\s\S]*?<\/td>[\s\S]*?<\/tr>[\s\S]*?\) :/g;
    content = content.replace(emptyBlock, (match, condition) => {
        return `${condition} ? (
              <tr>
                <td colSpan={100} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-slate-50 p-4 mb-2">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                    <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                  </div>
                </td>
              </tr>
            ) :`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Fixed manually: ${file}`);
    }
});
