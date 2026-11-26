'use client';

import React from 'react';
import Link from 'next/link';

export default function PlatformGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Super Admin Control Plane
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error?.message || 'An unexpected error interrupted this control-plane view.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Control Plane Home
          </Link>
        </div>
      </div>
    </div>
  );
}
