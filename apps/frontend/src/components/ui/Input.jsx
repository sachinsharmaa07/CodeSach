import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(
  ({ className, label, error, id, ...props }, ref) =>
    <div className="space-y-1.5">
      {label &&
        <label htmlFor={id} className="text-sm font-medium text-neutral-300">
          {label}
        </label>
      }
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-500',
          'border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-colors',
          error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
);