import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyBoxProps {
  text: string;
  className?: string;
}

export function CopyBox({ text, className }: CopyBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts (e.g. testing on local IP)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-2 print:block print:w-full print:whitespace-normal', className)}>
      <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-900 select-none print:p-0 print:border-none print:bg-transparent print:break-all print:whitespace-pre-wrap">
        {text}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors print:hidden"
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
