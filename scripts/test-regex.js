const str = `<Button variant="ghost" size="icon" onClick={() => set(prev => prev > 1)} className={cn("h-10 w-10", isActive && "bg-red")}>`;
const clean = str.replace(/\b(className|variant|size)\s*=\s*(?:"[^"]*"|'[^']*'|\{(?:[^{}]*|\{[^{}]*\})*\})/g, '').trim();
console.log(clean);
