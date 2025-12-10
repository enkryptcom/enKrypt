/// <reference types="vite/client" />

export namespace NodeJS {
  export interface ProcessEnv {
    BROWSER: 'chrome' | 'firefox' | 'edge' | 'opera' | 'safari';
    MINIFY: 'true' | 'false';
  }
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare let __PREFILL_PASSWORD__: string;
declare let __PACKAGE_VERSION__: string;
declare let __IS_DEV__: boolean;
declare let __IS_FIREFOX__: boolean;
declare let __IS_OPERA__: boolean;
declare let __IS_CHROME__: boolean;
declare let __IS_SAFARI__: boolean;
declare let __BUILD_TIME__: string;
