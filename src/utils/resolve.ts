import path from 'path';
import { fileURLToPath } from 'url';

export function createResolver(metaUrl = import.meta.url) {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = path.dirname(__filename);

  /**
   * Resolve a path relative to the current directory
   * @param {string} targetPath - The target path to resolve
   * @param {Boolean} alwaysSrc - Whether to always resolve from the src directory
   * @returns {string} - The resolved absolute path
   */
  function resolve(targetPath: string, alwaysSrc: Boolean = true): string {
    let current = __dirname
    if (alwaysSrc && current.includes('dist')) {
      current = current.replace('dist', 'src');
    }
    return path.resolve(current, targetPath);
  }

  return { __filename, __dirname, resolve };
}
