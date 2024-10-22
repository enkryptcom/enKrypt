/// <reference types="vite/client" />

namespace NodeJS {
  interface ProcessEnv {
    BROWSER: 'chrome' | 'firefox' | 'edge' | 'opera' | 'safari'
    MINIFY: 'true' | 'false'
  }
}
