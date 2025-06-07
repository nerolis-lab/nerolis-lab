import { describe, expect, it, vi } from 'vitest';
import { capitalize, compactNumber, localizeNumber } from './string-utils';

describe('capitalize', () => {
  it('shall capitalize a word', () => {
    expect(capitalize('cAPitALIze')).toEqual('Capitalize');
  });
});

describe('compactNumber', () => {
  it('should return the number as a string if less than 1000', () => {
    expect(compactNumber(500)).toEqual('500');
    expect(compactNumber(999)).toEqual('999');
  });

  it('should return the number in K format for thousands', () => {
    expect(compactNumber(1000)).toEqual('1K');
    expect(compactNumber(1500)).toEqual('1.5K');
    expect(compactNumber(999999)).toEqual('1000K');
  });

  it('should return the number in M format for millions', () => {
    expect(compactNumber(1000000)).toEqual('1M');
    expect(compactNumber(1500000)).toEqual('1.5M');
    expect(compactNumber(2500000)).toEqual('2.5M');
  });

  it('should handle edge cases with rounding', () => {
    expect(compactNumber(1000001)).toEqual('1M');
    expect(compactNumber(1999999)).toEqual('2M');
  });
});

describe('localizeNumber function', () => {
  test('formats numbers correctly using default locale', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });

    expect(localizeNumber(1234)).toEqual('1,234'); // Assuming 'en-US' as the default locale
    expect(localizeNumber(1000000)).toEqual('1,000,000');
    expect(localizeNumber(42.9)).toEqual('43');
    expect(localizeNumber(-1234)).toEqual('-1,234');
  });

  test('handles different user locales', () => {
    vi.stubGlobal('navigator', { language: 'de-DE' });
    expect(localizeNumber(1234)).toEqual('1.234'); // German uses dots as thousands separators

    vi.stubGlobal('navigator', { language: 'fr-FR' });
    expect(localizeNumber(1234)).toEqual('1 234'); // French uses a non-breaking space

    vi.stubGlobal('navigator', { language: 'sv-SE' });
    expect(localizeNumber(1234).replace(/\u00A0/g, ' ')).toBe('1 234'); // Normalize non-breaking space
  });

  test('falls back to en-US when navigator.language is undefined', () => {
    vi.stubGlobal('navigator', {});
    expect(localizeNumber(5678)).toEqual('5,678');
  });
});
