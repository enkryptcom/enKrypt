import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    tsconfigPaths() as any,
    nodePolyfills({
      include: ['crypto'],
    }),
  ],
  define: {
    __IS_OPERA__: false,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: [
      {
        find: /^(vite-plugin-node-polyfills\/shims\/.+)/,
        replacement: '$1',
        customResolver(source) {
          return import.meta.resolve(source).replace(/^file:\/\//, '');
        },
      },
    ],
  },
});
