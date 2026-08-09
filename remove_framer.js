const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      if(file.endsWith('.tsx')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const files = walkSync('src/components/landing');
files.push('src/pages/index.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Remove imports for framer-motion completely (usually they are on their own line)
  content = content.replace(/import\s+{[^}]*motion[^}]*}\s+from\s+['"]framer-motion['"];?\n?/g, '');
  content = content.replace(/import\s+motion\s+from\s+['"]framer-motion['"];?\n?/g, '');
  // also remove import { useScroll, useTransform } if they are imported from framer-motion
  content = content.replace(/import\s+{[^}]*(useScroll|useTransform|useSpring|useInView)[^}]*}\s+from\s+['"]framer-motion['"];?\n?/g, '');
  content = content.replace(/import\s+.*\s+from\s+['"]framer-motion['"];?\n?/g, ''); // catch all for framer-motion imports

  // Replace motion.tag with tag
  content = content.replace(/<motion\.([a-zA-Z0-9]+)/g, '<$1');
  content = content.replace(/<\/motion\.([a-zA-Z0-9]+)>/g, '</$1>');

  // Remove framer motion props
  const propsToRemove = ['initial', 'animate', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'exit', 'variants', 'style'];

  propsToRemove.forEach(prop => {
    // Basic regex to remove prop={...} where it might span multiple lines but doesn't have deep nesting.
    // Since React props can have nested braces, a simple regex is hard.
    // Let's do a more robust approach for simple cases.
    let regex1 = new RegExp(`\\s+${prop}=\\{[^{}]*\\}`, 'g');
    let regex2 = new RegExp(`\\s+${prop}=\\{\\{[^{}]*\\}\\}`, 'g');
    let regex3 = new RegExp(`\\s+${prop}=\\{\\{[^{}]*\\{[^{}]*\\}[^{}]*\\}\\}`, 'g');
    
    content = content.replace(regex3, '');
    content = content.replace(regex2, '');
    content = content.replace(regex1, '');
  });

  fs.writeFileSync(file, content);
  console.log('Processed', file);
});
