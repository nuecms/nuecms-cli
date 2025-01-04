import { defineConfig } from 'vite';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [tsconfigPaths(), dts()],
  build: {
    target: 'node18',
    minify: false,
    lib: {
      entry: {
        index: './src/index.ts',
        cli: './src/cli.ts'
      },
      name: 'NueCMSCLI',
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        'fs', 'path', 'url',
        'commander', '@inquirer/prompts',
        'mysql2/promise', 'dotenv', 'vite'
      ],
      output: {
        dir: 'dist',
        entryFileNames: '[name].js',
        format: 'es'
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
