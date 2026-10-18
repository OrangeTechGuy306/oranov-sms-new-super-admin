'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Info, AlertTriangle, AlertCircle, X, ShieldAlert } from 'lucide-react';

export interface AlertBannerProps {
  variant?: 'info' | 'warning' | 'error' | 'notice';
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  dismissible?: boolean;
  className?: string;
}

export function AlertBanner({
  variant = 'info',
  title,
  children,
  action,
  dismissible = false,
  className,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const variantStyles = {
    info: 'bg-blue-50/80 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-200',
    warning: 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200',
    error: 'bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200',
    notice: 'bg-indigo-50/80 border-indigo-200 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-200',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
    notice: <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-xl border flex items-start justify-between gap-3 text-sm shadow-2xs',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start gap-3 flex-1">
        {icons[variant]}
        <div className="space-y-1 flex-1">
          {title && <h4 className="font-semibold text-xs tracking-wider uppercase">{title}</h4>}
          <div className="text-xs leading-relaxed opacity-90">{children}</div>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-inherit opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
