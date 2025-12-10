// We use node crypto in packages/utils/src/encrypt.ts
// so we need to expose it to the vite jsdom environment
//
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import crypto from 'node:crypto';

globalThis.__VERSION__ = 'testing';
globalThis.__IS_OPERA__ = false;
