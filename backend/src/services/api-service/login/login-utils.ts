export function generateFriendCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charCount = chars.length;

  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * charCount))).join('');
}
