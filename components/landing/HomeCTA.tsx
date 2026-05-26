'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface HomeCTAProps {
  label: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function HomeCTA({ label, className, size = 'default' }: HomeCTAProps) {
  const router = useRouter();
  return (
    <Button
      type="button"
      size={size}
      className={className}
      onClick={() => router.push('/audit')}
      aria-label={label}
    >
      {label}
    </Button>
  );
}
