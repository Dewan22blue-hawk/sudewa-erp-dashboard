import Image from 'next/image';
import { ReactNode } from 'react';

interface PrintLetterPageProps {
  id?: string;
  letterheadSrc?: string;
  children: ReactNode;
  className?: string;
}

export function PrintLetterPage({ id, letterheadSrc, children, className }: PrintLetterPageProps) {
  return (
    <div id={id} className={`print-letter-page ${className || ''}`.trim()}>
      {letterheadSrc && (
        <Image
          src={letterheadSrc}
          alt=""
          aria-hidden
          className="print-letterhead"
          width={1240}
          height={1754}
          unoptimized
          priority
        />
      )}

      <div className="print-letter-content">{children}</div>
    </div>
  );
}
