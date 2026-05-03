import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useState, useEffect } from 'react';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/70 dark:bg-primary/70 border-white/20 dark:border-white/10 z-[1000] p-4 flex items-center gap-4',
          title: 'text-sm font-semibold',
          description: 'group-[.toast]:text-muted-foreground text-xs',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium',
          success: '!bg-green-500/20 !text-green-700 dark:!text-green-400 !border-green-500/30 !backdrop-blur-xl',
          error: '!bg-red-500/20 !text-red-700 dark:!text-red-400 !border-red-500/30 !backdrop-blur-xl',
          info: '!bg-blue-500/20 !text-blue-700 dark:!text-blue-400 !border-blue-500/30 !backdrop-blur-xl',
          warning: '!bg-amber-500/20 !text-amber-700 dark:!text-amber-400 !border-amber-500/30 !backdrop-blur-xl',
          closeButton: 'bg-white/10 hover:bg-white/20 dark:hover:bg-white/10 border-none transition-all duration-200 !text-inherit opacity-100',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-green-600 dark:text-green-400" />,
        info: <InfoIcon className="size-5 text-blue-600 dark:text-blue-400" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-600 dark:text-amber-400" />,
        error: <OctagonXIcon className="size-5 text-red-600 dark:text-red-400" />,
        loading: <Loader2Icon className="size-5 animate-spin text-primary" />,
      }}
      style={
        {
          '--normal-bg': 'transparent',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'transparent',
          '--border-radius': '1rem',
          '--offset': '5rem',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
