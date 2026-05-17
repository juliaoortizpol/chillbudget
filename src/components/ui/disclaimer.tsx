import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DisclaimerType = 'warning' | 'error' | 'info' | 'success';

interface DisclaimerProps {
  type?: DisclaimerType;
  title: string;
  text: React.ReactNode;
  className?: string;
}

const typeStyles: Record<DisclaimerType, { wrapper: string; icon: string; title: string; text: string }> = {
  warning: {
    wrapper: 'bg-amber-500/10 border-amber-500/20',
    icon: 'text-amber-600',
    title: 'text-amber-800',
    text: 'text-amber-700/80',
  },
  error: {
    wrapper: 'bg-red-500/10 border-red-500/20',
    icon: 'text-red-600',
    title: 'text-red-800',
    text: 'text-red-700/80',
  },
  info: {
    wrapper: 'bg-blue-500/10 border-blue-500/20',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    text: 'text-blue-700/80',
  },
  success: {
    wrapper: 'bg-emerald-500/10 border-emerald-500/20',
    icon: 'text-emerald-600',
    title: 'text-emerald-800',
    text: 'text-emerald-700/80',
  },
};

const iconMap: Record<DisclaimerType, React.ElementType> = {
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  success: CheckCircle,
};

export function Disclaimer({ type = 'warning', title, text, className }: DisclaimerProps) {
  const styles = typeStyles[type];
  const Icon = iconMap[type];

  return (
    <div className={cn("border rounded-xl p-4 flex items-start gap-3", styles.wrapper, className)}>
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", styles.icon)} />
      <div>
        <h3 className={cn("font-semibold text-sm", styles.title)}>{title}</h3>
        <p className={cn("text-sm mt-1", styles.text)}>{text}</p>
      </div>
    </div>
  );
}
