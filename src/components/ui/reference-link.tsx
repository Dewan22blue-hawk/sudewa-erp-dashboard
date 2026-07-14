import * as React from 'react';
import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReferenceLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const ReferenceLink = React.forwardRef<HTMLAnchorElement, ReferenceLinkProps>(
  ({ className, href, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium cursor-pointer',
          className
        )}
        {...props}
      >
        <Link2 className="h-3.5 w-3.5 shrink-0" />
        <span>{children}</span>
      </Link>
    );
  }
);

ReferenceLink.displayName = 'ReferenceLink';

export { ReferenceLink };
