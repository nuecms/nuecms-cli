import { defineConfig } from 'vite';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [tsconfigPaths(), dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'NueCMSCLI',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.es.js' : 'index.js')
    },
    rollupOptions: {
      external: ['prompts', 'mysql2'],
      output: {
        globals: {
          prompts: 'prompts',
          mysql2: 'mysql2'
        }
      }
    },
    sourcemap: false,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@commands': path.resolve(__dirname, 'src/commands')
    }
  }
});
