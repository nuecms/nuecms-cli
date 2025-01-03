import { defineConfig } from 'vite';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [tsconfigPaths(), dts()],
  build: {
    target: 'node18',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'NueCMSCLI',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'fs', 'path', 'url',
        'commander', '@inquirer/prompts', 'mysql2/promise', 'dotenv'],
      output: {
        globals: {
          commander: 'commander',
          '@inquirer/prompts': '@inquirer/prompts',
          'mysql2/promise': 'mysql2/promise',
          'dotenv': 'dotenv',
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
