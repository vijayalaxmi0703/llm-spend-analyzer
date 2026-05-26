import * as React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'w-full rounded-lg border border-accent-primary/12 bg-elevated/40 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50',
        'transition-all duration-200',
        'focus:border-accent-primary/30 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:bg-elevated/60',
        'hover:border-accent-primary/20 hover:bg-elevated/50',
        className
      )}
      {...props}
    />
  );
}
