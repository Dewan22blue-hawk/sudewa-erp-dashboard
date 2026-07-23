const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src/pages', 'src/components', 'src/hooks', 'src/services'];
const EXTENSIONS = ['.tsx'];

// Utility to remove className, variant, and size from a <Button ...> tag
function cleanButtonProps(tagStr) {
  return tagStr.replace(/\b(className|variant|size)\s*=\s*(?:"[^"]*"|'[^']*'|\{(?:[^{}]*|\{[^{}]*\})*\})/g, '');
}

function findOpeningTagEnd(str, startIdx) {
  let inString = false;
  let stringChar = '';
  let bracesDepth = 0;

  for (let i = startIdx; i < str.length; i++) {
    const char = str[i];
    if (inString) {
      if (char === stringChar) inString = false;
    } else {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '{') {
        bracesDepth++;
      } else if (char === '}') {
        bracesDepth--;
      } else if (char === '>' && bracesDepth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (EXTENSIONS.some((ext) => fullPath.endsWith(ext))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  let pos = 0;
  while (true) {
    const buttonStart = content.indexOf('<Button', pos);
    if (buttonStart === -1) break;

    const openingTagEnd = findOpeningTagEnd(content, buttonStart + 7);
    if (openingTagEnd === -1) {
      pos = buttonStart + 7;
      continue; // Malformed tag
    }

    const openingTag = content.substring(buttonStart, openingTagEnd + 1);

    // Check if self closing
    const isSelfClosing = openingTag.endsWith('/>');

    if (isSelfClosing) {
      // We don't standardize self-closing buttons for this logic because we rely on inner content to know the type
      pos = openingTagEnd + 1;
      continue;
    }

    const closingTagIdx = content.indexOf('</Button>', openingTagEnd + 1);
    if (closingTagIdx === -1) {
      pos = openingTagEnd + 1;
      continue;
    }

    const innerContent = content.substring(openingTagEnd + 1, closingTagIdx);
    const fullMatch = content.substring(buttonStart, closingTagIdx + 9);

    let newAttrs = '';
    const hasArrowLeft = /<ArrowLeft/.test(innerContent);
    const hasAdd = /Tambah/i.test(innerContent) || /<Plus/.test(innerContent);
    const hasAction = /Export|Import|Download|Print/i.test(innerContent) || /<(Upload|Download|Printer)/.test(innerContent);

    if (hasArrowLeft) {
      newAttrs = ` variant="ghost" size="icon" className="h-10 w-10 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer"`;
    } else if (hasAdd) {
      newAttrs = ` className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]"`;
    } else if (hasAction) {
      newAttrs = ` variant="outline" className="w-full sm:w-auto"`;
    } else {
      pos = closingTagIdx + 9;
      continue;
    }

    // Strip out the first '<Button' and the last '>'
    let innerAttrs = openingTag.substring(7, openingTag.length - 1);
    let cleanedAttrs = cleanButtonProps(innerAttrs);

    cleanedAttrs = cleanedAttrs.replace(/\s+/g, ' ').trim();
    const finalAttrs = cleanedAttrs ? ` ${cleanedAttrs}${newAttrs}` : `${newAttrs}`;

    const newOpeningTag = `<Button${finalAttrs}>`;
    const newBlock = newOpeningTag + innerContent + '</Button>';

    content = content.substring(0, buttonStart) + newBlock + content.substring(closingTagIdx + 9);

    // update pos
    pos = buttonStart + newBlock.length;
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

DIRECTORIES.forEach((dir) => {
  const fullPath = path.resolve(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});
