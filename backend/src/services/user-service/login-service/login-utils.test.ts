import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import { describe, expect, it } from 'vitest';

describe('generateFriendCode', () => {
  it('should generate a code of the default length (6)', () => {
    const code = generateFriendCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('should generate a code of the specified length', () => {
    const length = 8;
    const code = generateFriendCode(length);
    expect(code).toHaveLength(length);
    expect(code).toMatch(/^[A-Z0-9]{8}$/);
  });

  it('should generate unique codes', () => {
    const codes = new Set();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateFriendCode());
    }
    expect(codes.size).toBe(1000);
  });

  it('should handle a length of 0 gracefully', () => {
    const code = generateFriendCode(0);
    expect(code).toBe('');
  });

  it('should handle a length of 1 correctly', () => {
    const code = generateFriendCode(1);
    expect(code).toHaveLength(1);
    expect(code).toMatch(/^[A-Z0-9]$/);
  });
});
