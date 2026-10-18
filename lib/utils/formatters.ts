/**
 * Enterprise formatting utilities for dates, currency, numbers, and badge styles.
 */

export function formatCurrency(
  amount: number,
  currencyCode = 'USD',
  locale = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

export function formatNumber(value: number, locale = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}

export function formatDate(
  dateInput: string | Date | undefined,
  includeTime = false,
  locale = 'en-US'
): string {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };

    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return String(dateInput);
  }
}

export function getInitials(name?: string): string {
  if (!name) return 'SA';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getStatusBadgeVariant(status: string): {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
} {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'operational':
    case 'paid':
    case 'succeeded':
      return { variant: 'success', label: capitalize(status) };
    case 'pending':
    case 'in_progress':
    case 'trialing':
    case 'degraded':
    case 'warning':
    case 'issued':
      return { variant: 'warning', label: capitalize(status.replace('_', ' ')) };
    case 'suspended':
    case 'canceled':
    case 'outage':
    case 'failed':
    case 'overdue':
      return { variant: 'error', label: capitalize(status) };
    case 'verification_pending':
      return { variant: 'info', label: 'Verification Pending' };
    case 'inactive':
    case 'not_started':
    case 'maintenance':
    case 'draft':
    case 'void':
      return { variant: 'neutral', label: capitalize(status.replace('_', ' ')) };
    default:
      return { variant: 'neutral', label: capitalize(status.replace(/_/g, ' ')) };
  }
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
