import * as React from 'react';
import { clsx } from 'clsx';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-lg border bg-card-bg/82 shadow-soft transition-all duration-300 hover:shadow-glow-sm',
        'border-accent-primary/12',
        'hover:border-accent-primary/20',
        className
      )}
      {...props}
    />
  );
}
