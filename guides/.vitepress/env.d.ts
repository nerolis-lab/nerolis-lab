/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Dev-only: origin of the main SPA (e.g. http://localhost:8001) for header links when running VitePress on :5173 */
  readonly VITE_MAIN_DEV_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
