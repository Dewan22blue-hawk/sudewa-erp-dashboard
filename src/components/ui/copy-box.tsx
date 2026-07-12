import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyBoxProps {
  text: string;
  className?: string;
}

export function CopyBox({ text, className }: CopyBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      //
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-900 select-none">
        {text}
      </div>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
