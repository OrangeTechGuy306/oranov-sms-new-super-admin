/**
 * URL Security Utilities for the Super Admin Console
 *
 * Prevents open redirects, encoded slash/backslash bypasses, header injection,
 * and dangerous link schemes (`javascript:`, `data:`, `vbscript:`).
 */

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/;
const EXPLICIT_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

function safeMultiDecode(value: string): string | null {
  let current = value;
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) return current;
      current = next;
    } catch {
      return null;
    }
  }
  return current;
}

export function getSafePlatformReturnUrl(
  url: string | null | undefined,
  fallback = '/'
): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  if (
    trimmed.includes('\\') ||
    /%5c/i.test(trimmed) ||
    /^\/%2f/i.test(trimmed) ||
    CONTROL_CHARS_REGEX.test(trimmed)
  ) {
    return fallback;
  }

  const decoded = safeMultiDecode(trimmed);
  if (decoded === null) return fallback;

  if (
    decoded.includes('\\') ||
    decoded.startsWith('//') ||
    CONTROL_CHARS_REGEX.test(decoded) ||
    EXPLICIT_SCHEME_REGEX.test(trimmed) ||
    EXPLICIT_SCHEME_REGEX.test(decoded)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, 'http://platform.sms.local');
    if (parsed.origin !== 'http://platform.sms.local') {
      return fallback;
    }

    const destination = parsed.pathname + parsed.search + parsed.hash;
    if (
      !destination.startsWith('/') ||
      destination.startsWith('//') ||
      destination.startsWith('/\\')
    ) {
      return fallback;
    }

    // Never bounce back onto guest-only auth screens
    if (
      parsed.pathname === '/login' ||
      parsed.pathname === '/2fa' ||
      parsed.pathname === '/forgot-password' ||
      parsed.pathname === '/reset-password' ||
      parsed.pathname === '/accept-invitation'
    ) {
      return fallback;
    }

    return destination;
  } catch {
    return fallback;
  }
}

export function isSafeExternalOrInternalUrl(
  url: string | null | undefined,
  options: { allowExternalHttp?: boolean } = {}
): boolean {
  const { allowExternalHttp = true } = options;
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed || CONTROL_CHARS_REGEX.test(trimmed)) return false;

  const decoded = safeMultiDecode(trimmed);
  if (decoded === null || CONTROL_CHARS_REGEX.test(decoded)) return false;

  if (trimmed.startsWith('/')) {
    return getSafePlatformReturnUrl(trimmed, '__INVALID__') !== '__INVALID__';
  }

  try {
    const parsed = new URL(trimmed);
    const proto = parsed.protocol.toLowerCase();
    if (proto === 'https:' || proto === 'http:') {
      return allowExternalHttp;
    }
    return false;
  } catch {
    return false;
  }
}
