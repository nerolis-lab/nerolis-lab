// resolves main-app URLs from the guides shell (local: full origin; prod: root-relative)
export function useMainAppNavHref(): (path: string) => string {
  return function mainAppNavHref(path: string): string {
    if (path.startsWith('/guides')) {
      return path;
    }
    if (import.meta.env.PROD) {
      // this is not just prod, but any build for deployment
      return path;
    }
    const origin = (import.meta.env.VITE_MAIN_DEV_ORIGIN ?? 'http://localhost:8001').replace(/\/$/, '');
    if (path === '/') {
      return `${origin}/`;
    }
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  };
}
