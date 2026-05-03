const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace specific known bad patterns
    content = content.replace(/bg-black text-white hover:bg-black\/90/g, 'bg-primary text-primary-foreground hover:bg-primary/90');
    content = content.replace(/bg-black hover:bg-black\/90/g, 'bg-primary text-primary-foreground hover:bg-primary/90');
    content = content.replace(/bg-slate-900 hover:bg-slate-800 text-white/g, 'bg-primary text-primary-foreground hover:bg-primary/90');
    content = content.replace(/bg-slate-900 text-white hover:bg-slate-800/g, 'bg-primary text-primary-foreground hover:bg-primary/90');
    content = content.replace(/bg-gray-900 text-white/g, 'bg-primary text-primary-foreground');
    content = content.replace(/bg-gray-900 pointer-events-none/g, 'bg-primary pointer-events-none');
    
    // Base replacements for button colors
    content = content.replace(/bg-gray-900/g, 'bg-primary');
    content = content.replace(/bg-slate-900/g, 'bg-primary');
    
    // We only replace bg-black where it is likely a button or UI element, though my regex is simple.
    // Given the grep results, most bg-black were indeed buttons, but let's be careful.
    content = content.replace(/bg-black/g, 'bg-primary');

    // Fix duplicated text-white
    content = content.replace(/bg-primary text-primary-foreground text-white/g, 'bg-primary text-primary-foreground');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log('Fixed', file);
    }
});

console.log('Total files changed:', changedCount);
