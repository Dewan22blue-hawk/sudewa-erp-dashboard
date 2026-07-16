const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src/components/features -type f -name "*.tsx"').toString().trim().split('\n');

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    const needsLoader = content.includes('<Loader2');
    const needsSearch = content.includes('<Search');

    if (needsLoader || needsSearch) {
        if (content.includes("from 'lucide-react'")) {
            // Check what is missing
            const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
            if (importMatch) {
                let imports = importMatch[1].split(',').map(s => s.trim()).filter(s => s);
                if (needsLoader && !imports.includes('Loader2')) imports.push('Loader2');
                if (needsSearch && !imports.includes('Search')) imports.push('Search');
                
                content = content.replace(importMatch[0], `import { ${imports.join(', ')} } from 'lucide-react'`);
            }
        } else {
            // Need to add entirely
            let imports = [];
            if (needsLoader) imports.push('Loader2');
            if (needsSearch) imports.push('Search');
            
            // Add after first import
            content = content.replace(/^(import.*)$/m, `$1\nimport { ${imports.join(', ')} } from 'lucide-react';`);
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`Fixed imports in: ${file}`);
    }
});
