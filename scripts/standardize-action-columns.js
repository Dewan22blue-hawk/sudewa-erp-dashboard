const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src/components/features -type f -name "*.tsx"').toString().trim().split('\n');

let modifiedCount = 0;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Action cells: cells containing DropdownMenu, directly or inside a div
    // Pattern: <td ...> or <TableCell ...> followed by optional whitespace, optional <div>, optional whitespace, <DropdownMenu
    const regex = /<(td|TableCell)([^>]*?)>(\s*(?:<div[^>]*>\s*)?<DropdownMenu>)/g;
    content = content.replace(regex, (match, tag, attrs, inner) => {
        if (attrs.includes('sticky')) return match;
        const classRegex = /className="([^"]*)"/;
        let newAttrs = attrs;
        if (classRegex.test(newAttrs)) {
            newAttrs = newAttrs.replace(classRegex, (classMatch, classString) => {
                let classes = classString.split(' ').filter(c => c && c !== 'bg-gray-100' && c !== 'bg-gray-50');
                if (!classes.includes('sticky')) {
                    classes.push('sticky', 'right-0', 'bg-white', 'group-hover:bg-slate-50', 'z-10', 'border-l', 'border-slate-200', 'shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]');
                }
                return `className="${classes.join(' ')}"`;
            });
        } else {
             newAttrs += ` className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]"`;
        }
        return `<${tag}${newAttrs}>${inner}`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        modifiedCount++;
        console.log(`Modified: ${file}`);
    }
});

console.log(`Modified ${modifiedCount} files.`);
