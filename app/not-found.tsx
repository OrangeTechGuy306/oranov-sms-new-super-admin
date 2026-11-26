import Link from 'next/link';

export default function PlatformNotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            404 · Not Found
          </p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Platform route not found
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The requested Super Admin route or resource could not be located.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
