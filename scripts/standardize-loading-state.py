import os
import re

def find_files(directory, pattern):
    import fnmatch
    matches = []
    for root, dirnames, filenames in os.walk(directory):
        for filename in fnmatch.filter(filenames, pattern):
            matches.append(os.path.join(root, filename))
    return matches

def standardize_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # 1. Replace "Memuat data..." single cell patterns
    # We look for <td...> ... Memuat data ... </td>
    cell_pattern = re.compile(r'<(td|TableCell)([^>]*?)>([\s\S]*?Memuat data[\s\S]*?)</\1>', re.IGNORECASE)
    
    def repl_cell(m):
        tag = m.group(1)
        attrs = m.group(2)
        
        # Strip sticky and hover from full-width row
        attrs = re.sub(r'sticky right-0 bg-(white|\[#f8f9fa\]) z-10 border-l border-slate-200 shadow-\[-4px_0_6px_-4px_rgba\(0,0,0,0\.05\)\]', '', attrs)
        attrs = re.sub(r'group-hover:bg-slate-50', '', attrs)
        
        if 'py-' not in attrs:
            attrs = attrs.replace('className="', 'className="py-16 ')
            
        return f'<{tag}{attrs}>\n    <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">\n        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />\n        <span className="text-sm font-medium text-slate-500">Memuat data...</span>\n    </div>\n</{tag}>'
        
    content = cell_pattern.sub(repl_cell, content)
    
    # 2. Replace Array maps used for loading (Skeleton / animate-pulse)
    # This is trickier, we search for isLoading ? ( ... ) :
    # We will use simple regex for common blocks like:
    # {isLoading ? ( Array.from... ) :
    # {isLoading ? ( [...Array... ) :
    
    # We can match {isLoading ? ( \s* \[?\.\.\.Array | Array\.from ...
    
    map_pattern = re.compile(r'({(?:isLoading|loading)(?:\s*&&\s*data\.length\s*===\s*0)?\s*\?\s*\(\s*(?:\[\.\.\.Array|Array\.from)[\s\S]*?)(?=\)\s*:\s*(?:data|sortedData|table))', re.IGNORECASE)
    
    def repl_map(m):
        # We replace the entire loading map with a simple TR
        return '{isLoading ? (\n    <tr>\n        <td colSpan={100} className="px-4 py-16 text-center bg-white">\n            <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">\n                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />\n                <span className="text-sm font-medium text-slate-500">Memuat data...</span>\n            </div>\n        </td>\n    </tr>\n'
        
    # Wait, the regex must find the matching closing parenthesis of the ternary. 
    # That is too hard with regex. Let's do it with python string finding.
    
    # Custom parser
    start_idx = 0
    while True:
        # Find "isLoading ? (" or "loading ? ("
        m = re.search(r'\{(isLoading|loading)(?:\s*&&\s*[a-zA-Z0-9\.]+\s*===\s*0)?\s*\?\s*\(', content[start_idx:])
        if not m:
            break
            
        match_start = start_idx + m.start()
        
        # Check if the block has Array.from or [...Array
        # We find the matching closing ')' for the '('
        open_paren_idx = match_start + m.group(0).rfind('(')
        
        parens = 1
        idx = open_paren_idx + 1
        while idx < len(content) and parens > 0:
            if content[idx] == '(':
                parens += 1
            elif content[idx] == ')':
                parens -= 1
            idx += 1
            
        match_end = idx
        
        inside = content[open_paren_idx:match_end]
        
        if 'Array' in inside or 'animate-pulse' in inside or 'Skeleton' in inside:
            # We replace it
            replacement = '(\n    <tr>\n        <td colSpan={100} className="px-4 py-16 text-center bg-white">\n            <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">\n                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />\n                <span className="text-sm font-medium text-slate-500">Memuat data...</span>\n            </div>\n        </td>\n    </tr>\n)'
            
            content = content[:open_paren_idx] + replacement + content[match_end:]
            start_idx = open_paren_idx + len(replacement)
        else:
            start_idx = match_end
            
    
    if content != original:
        if 'Loader2' not in content and 'lucide-react' in content:
            content = re.sub(r"import \{([^}]+)\} from 'lucide-react';", r"import { Loader2, \1} from 'lucide-react';", content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

files = find_files('src/components/features', '*Table*.tsx')
# Also include other non-table files that might act as tables if any
files += find_files('src/components/features', '*Inline*.tsx')
files += find_files('src/components/features', '*Content*.tsx')

count = 0
for f in files:
    if standardize_file(f):
        print(f"Modified loading state: {f}")
        count += 1
        
print(f"Modified {count} files.")
