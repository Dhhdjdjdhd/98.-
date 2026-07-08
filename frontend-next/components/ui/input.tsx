import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border-[1.5px] border-line bg-cream px-4 py-3.5 text-[14.5px] text-ink outline-none transition focus:border-terra',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-bold text-ink-2">{label}</label>
      {children}
    </div>
  );
}
