import { cn } from '@/lib/utils';

const variants = {
  easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hard: 'bg-red-500/10 text-red-400 border-red-500/20',
  default: 'bg-white/5 text-neutral-400 border-white/10',
};

export const Badge = ({
  label,
  variant = 'default',
  className,
}: {
  label: string;
  variant?: keyof typeof variants;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
      variants[variant],
      className,
    )}
  >
    {label}
  </span>
);
