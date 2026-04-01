/**
 * Resolves main-app URLs from the guides shell (dev: full origin; prod: root-relative).
 */
export function useMainAppNavHref(): (path: string) => string {
  return function mainAppNavHref(path: string): string {
    if (path.startsWith('/guides')) {
      return path;
    }
    if (import.meta.env.PROD) {
      return path;
    }
    const origin = (import.meta.env.VITE_MAIN_DEV_ORIGIN ?? 'http://localhost:8001').replace(/\/$/, '');
    if (path === '/') {
      return `${origin}/`;
    }
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  };
}
