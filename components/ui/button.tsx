import * as React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon-sm' | 'icon';
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/60 disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-95 active:opacity-90',
        variant === 'default' && 'bg-gradient-to-br from-accent-primary to-accent-secondary text-primary-bg shadow-glow-lg hover:shadow-glow-lg hover:from-accent-hover hover:to-accent-primary',
        variant === 'secondary' && 'border border-accent-primary/20 bg-card-bg/60 text-text-primary hover:bg-card-bg hover:border-accent-primary/40',
        variant === 'outline' && 'border border-accent-primary/30 bg-transparent text-text-primary hover:bg-elevated/40 hover:border-accent-primary/50',
        variant === 'ghost' && 'bg-transparent text-text-primary hover:bg-elevated/20',
        size === 'sm' && 'px-3 py-2 text-xs',
        size === 'lg' && 'px-6 py-4 text-base',
        size === 'icon-sm' && 'px-2 py-1 size-9',
        size === 'icon' && 'px-2 py-1 size-10',
        className
      )}
      {...props}
    />
  );
}
