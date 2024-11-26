import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    tsconfigPaths() as any,
    nodePolyfills({
      include: [
        'crypto',
        // ... include other Node.js modules if needed
      ],
    }),
  ],
  define: {
    // setting __VERSION__ here blows it up for some reason
    // __VERSION__: 'testing',
    __IS_OPERA__: false,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'src/**/*.{test,spec}.ts',
      'tests/**/*.{test,spec}.ts',
    ],
  },
});
