const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('find src/components/features -type f -name "*.tsx"').toString().trim().split('\n');
let missingSticky = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.match(/<(th|TableHead)[^>]*>\s*(ACTION|Action|Aksi)\b\s*<\/(th|TableHead)>/i)) {
        if (!content.includes('sticky right-0 bg-[#f8f9fa]')) {
            missingSticky.push(file);
        }
    } else if (content.match(/isAction\s*\?/)) {
        if (!content.includes('sticky right-0 bg-[#f8f9fa]')) {
            missingSticky.push(file);
        }
    }
});

console.log(missingSticky.join('\n'));
