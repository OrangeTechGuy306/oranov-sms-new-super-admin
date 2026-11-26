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
    case 'simulated_complete':
      return { variant: 'success', label: capitalize(status.replace(/_/g, ' ')) };
    case 'trial':
    case 'trialing':
    case 'onboarding_in_progress':
    case 'awaiting_activation':
    case 'simulated_in_progress':
      return { variant: 'info', label: capitalize(status.replace(/_/g, ' ')) };
    case 'verification_pending':
      return { variant: 'info', label: 'Verification Pending' };
    case 'pending':
    case 'registration_pending':
    case 'awaiting_configuration':
    case 'cancellation_pending':
    case 'in_progress':
    case 'past_due':
    case 'grace_period':
    case 'pending_payment':
    case 'ready_for_review':
    case 'needs_attention':
    case 'degraded':
    case 'warning':
    case 'issued':
    case 'under_maintenance':
    case 'planned':
      return { variant: 'warning', label: capitalize(status.replace(/_/g, ' ')) };
    case 'suspended':
    case 'cancelled':
    case 'canceled':
    case 'closed':
    case 'expired':
    case 'outage':
    case 'failed':
    case 'simulated_failed':
    case 'overdue':
      return { variant: 'error', label: capitalize(status.replace(/_/g, ' ')) };
    case 'inactive':
    case 'archived':
    case 'not_started':
    case 'maintenance':
    case 'draft':
    case 'void':
    case 'unbilled':
      return { variant: 'neutral', label: capitalize(status.replace(/_/g, ' ')) };
    default:
      return { variant: 'neutral', label: capitalize(status.replace(/_/g, ' ')) };
  }
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
