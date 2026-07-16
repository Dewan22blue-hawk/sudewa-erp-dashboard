const fs = require('fs');

const files = [
    'src/components/features/ppn-pembelian/PPNPembelianTable.tsx',
    'src/components/features/ppn-penjualan/PPNPenjualanTable.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // add imports
    content = content.replace("MoreVertical } from 'lucide-react';", "MoreVertical, Loader2, Search } from 'lucide-react';");
    content = content.replace("ArrowDown } from 'lucide-react';", "ArrowDown, Loader2, Search } from 'lucide-react';");

    // replace loading
    const loadingBlock = /isLoading \? \([\s\S]*?Array\.from\(\{ length: 6 \}\)\.map\(\(_, index\) => <SkeletonRow key=\{index\} \/>\)[\s\S]*?\) :/g;
    
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

    // replace empty
    const emptyBlock = /data\.length === 0 \? \([\s\S]*?<tr>[\s\S]*?<td[^>]*>[\s\S]*?(?:Tidak ada data PPN pembelian|Tidak ada data PPN penjualan)[\s\S]*?<\/td>[\s\S]*?<\/tr>[\s\S]*?\) :/g;

    content = content.replace(emptyBlock, `data.length === 0 ? (
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
            ) :`);
            
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
});
