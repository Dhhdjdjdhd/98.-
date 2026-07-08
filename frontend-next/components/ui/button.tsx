import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-terra text-white hover:bg-terra-2 shadow-[0_14px_30px_-12px_rgba(217,108,74,0.7)]',
  pine: 'bg-pine text-cream hover:bg-terra',
  ghost: 'bg-cream text-pine border-[1.5px] border-line hover:border-pine',
  soft: 'bg-cream text-pine border-[1.5px] border-line hover:border-terra text-left',
} as const;

type Variant = keyof typeof variants;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-[15px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
