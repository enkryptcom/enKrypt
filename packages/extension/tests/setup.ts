// We use node crypto in packages/utils/src/encrypt.ts
// so we need to expose it to the vite jsdom environment
//
import crypto from 'node:crypto'


globalThis.__VERSION__ = 'testing'
globalThis.__IS_OPERA__ = false;
