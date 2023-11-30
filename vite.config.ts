// vite.config.ts
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: 'esnext', // Ensure that you are targeting a version of ECMAScript that supports top-level `await`
  },
});
