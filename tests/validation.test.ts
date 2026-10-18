import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getInitials,
  getStatusBadgeVariant,
} from '../lib/utils/formatters';

describe('Formatters and Presentation Utilities', () => {
  it('formats currency correctly with standard currency symbols', () => {
    assert.strictEqual(formatCurrency(12000, 'USD'), '$12,000');
    assert.strictEqual(formatCurrency(0, 'USD'), '$0');
    assert.strictEqual(formatCurrency(24500, 'USD'), '$24,500');
  });

  it('formats dates consistently', () => {
    const formatted = formatDate('2026-03-15T00:00:00Z');
    assert.ok(formatted.includes('2026'));
    assert.strictEqual(formatDate(null as unknown as undefined), '—');
    assert.strictEqual(formatDate(undefined), '—');
  });

  it('formats numbers with thousand separators', () => {
    assert.strictEqual(formatNumber(1250000), '1,250,000');
    assert.strictEqual(formatNumber(0), '0');
  });

  it('extracts initials cleanly from personal or organization names', () => {
    assert.strictEqual(getInitials('Apex Horizon Academy'), 'AA');
    assert.strictEqual(getInitials('John Doe'), 'JD');
    assert.strictEqual(getInitials('SingleName'), 'SI');
    assert.strictEqual(getInitials(''), 'SA');
  });

  it('maps lifecycle and subscription status to distinct badge variants and human-readable labels', () => {
    assert.deepStrictEqual(getStatusBadgeVariant('active'), { variant: 'success', label: 'Active' });
    assert.deepStrictEqual(getStatusBadgeVariant('verification_pending'), { variant: 'info', label: 'Verification Pending' });
    assert.deepStrictEqual(getStatusBadgeVariant('suspended'), { variant: 'error', label: 'Suspended' });
    assert.deepStrictEqual(getStatusBadgeVariant('draft'), { variant: 'neutral', label: 'Draft' });
    assert.deepStrictEqual(getStatusBadgeVariant('unknown_status'), { variant: 'neutral', label: 'Unknown status' });
  });
});

describe('Onboarding and Technical Slug Validation Logic', () => {
  const isValidSubdomain = (subdomain: string) => /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(subdomain);
  const isValidOrgCode = (code: string) => /^[A-Z0-9_-]{3,12}$/.test(code);
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  it('validates subdomain strings according to RFC 1035 / DNS standards', () => {
    assert.strictEqual(isValidSubdomain('apex-horizon'), true);
    assert.strictEqual(isValidSubdomain('school123'), true);
    assert.strictEqual(isValidSubdomain('Apex-Horizon'), false); // Uppercase not allowed in canonical subdomain
    assert.strictEqual(isValidSubdomain('-leading-hyphen'), false);
    assert.strictEqual(isValidSubdomain('trailing-hyphen-'), false);
    assert.strictEqual(isValidSubdomain('a'), false); // Too short (< 3 chars)
  });

  it('validates organization codes for standard alphanumeric formats', () => {
    assert.strictEqual(isValidOrgCode('APEX-01'), true);
    assert.strictEqual(isValidOrgCode('SCH_2026'), true);
    assert.strictEqual(isValidOrgCode('A'), false); // Too short
    assert.strictEqual(isValidOrgCode('apex-01'), false); // Must be uppercase
    assert.strictEqual(isValidOrgCode('APEX 01'), false); // Spaces not allowed
  });

  it('validates email addresses for admin registration', () => {
    assert.strictEqual(isValidEmail('admin@apexhorizon.edu'), true);
    assert.strictEqual(isValidEmail('invalid-email'), false);
    assert.strictEqual(isValidEmail('@apexhorizon.edu'), false);
  });
});
