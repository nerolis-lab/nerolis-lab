import { describe, expect, it, vi } from 'vitest';
import { capitalize, compactNumber, localizeNumber } from './string-utils';

describe('capitalize', () => {
  it('shall capitalize a word', () => {
    expect(capitalize('cAPitALIze')).toEqual('Capitalize');
  });
});

describe('compactNumber', () => {
  describe('numbers less than 1000', () => {
    it('should round numbers less than 1000 with default rounding', () => {
      expect(compactNumber(500.6789)).toEqual('500.7');
      expect(compactNumber(123.456)).toEqual('123.5');
      expect(compactNumber(50.5)).toEqual('50.5');
      expect(compactNumber(50.0)).toEqual('50');
    });

    it('should support floor rounding for numbers less than 1000', () => {
      expect(compactNumber(500.6789, 'floor')).toEqual('500.6');
      expect(compactNumber(123.456, 'floor')).toEqual('123.4');
    });

    it('should support ceil rounding for numbers less than 1000', () => {
      expect(compactNumber(500.6789, 'ceil')).toEqual('500.7');
      expect(compactNumber(123.451, 'ceil')).toEqual('123.5');
    });

    it('should support custom decimal places for numbers less than 1000', () => {
      expect(compactNumber(123.456, 0)).toEqual('123');
      expect(compactNumber(123.456, 2)).toEqual('123.46');
    });
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

  describe('with floor rounding', () => {
    it('should floor numbers under 1000', () => {
      expect(compactNumber(549, 'floor')).toEqual('549');
      expect(compactNumber(551, 'floor')).toEqual('551');
      expect(compactNumber(599.9, 'floor')).toEqual('599.9');
    });

    it('should floor thousands', () => {
      expect(compactNumber(1549, 'floor')).toEqual('1.5K');
      expect(compactNumber(1551, 'floor')).toEqual('1.5K');
      expect(compactNumber(1599, 'floor')).toEqual('1.5K');
    });

    it('should floor millions', () => {
      expect(compactNumber(1549000, 'floor')).toEqual('1.5M');
      expect(compactNumber(1551000, 'floor')).toEqual('1.5M');
      expect(compactNumber(1599000, 'floor')).toEqual('1.5M');
    });
  });

  describe('with ceil rounding', () => {
    it('should ceil numbers under 1000', () => {
      expect(compactNumber(549.1, 'ceil')).toEqual('549.1');
      expect(compactNumber(551.5, 'ceil')).toEqual('551.5');
      expect(compactNumber(599.01, 'ceil')).toEqual('599.1');
    });

    it('should ceil thousands', () => {
      expect(compactNumber(1501, 'ceil')).toEqual('1.6K');
      expect(compactNumber(1549, 'ceil')).toEqual('1.6K');
      expect(compactNumber(1551, 'ceil')).toEqual('1.6K');
    });

    it('should ceil millions', () => {
      expect(compactNumber(1501000, 'ceil')).toEqual('1.6M');
      expect(compactNumber(1549000, 'ceil')).toEqual('1.6M');
      expect(compactNumber(1551000, 'ceil')).toEqual('1.6M');
    });
  });

  describe('with custom decimal places', () => {
    it('should round numbers under 1000 to specified decimal places', () => {
      expect(compactNumber(123.456, 0)).toEqual('123');
      expect(compactNumber(123.456, 1)).toEqual('123.5');
      expect(compactNumber(123.456, 2)).toEqual('123.46');
    });

    it('should round thousands to specified decimal places', () => {
      expect(compactNumber(1234, 0)).toEqual('1K');
      expect(compactNumber(1234, 1)).toEqual('1.2K');
      expect(compactNumber(1234, 2)).toEqual('1.2K');
    });

    it('should round millions to specified decimal places', () => {
      expect(compactNumber(1234567, 0)).toEqual('1M');
      expect(compactNumber(1234567, 1)).toEqual('1.2M');
      expect(compactNumber(1234567, 2)).toEqual('1.2M');
    });
  });

  describe('without rounding parameter (default)', () => {
    it('should default to 1 decimal place rounding for numbers under 1000', () => {
      expect(compactNumber(549)).toEqual('549');
      expect(compactNumber(549.67)).toEqual('549.7');
      expect(compactNumber(123.45)).toEqual('123.5');
    });

    it('should default to 1 decimal place rounding for thousands', () => {
      expect(compactNumber(1549)).toEqual('1.5K');
      expect(compactNumber(1551)).toEqual('1.6K');
      expect(compactNumber(1234)).toEqual('1.2K');
    });

    it('should default to 1 decimal place rounding for millions', () => {
      expect(compactNumber(1549000)).toEqual('1.5M');
      expect(compactNumber(1551000)).toEqual('1.6M');
      expect(compactNumber(1234567)).toEqual('1.2M');
    });
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
