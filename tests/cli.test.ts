import { describe, it, expect, vi } from 'vitest';
import { exec } from 'child_process';

describe('CLI Tests', () => {
  it('should display help message', (done) => {
    exec('nuecms-cli --help', (error, stdout, stderr) => {
      expect(stdout).toContain('Usage: nuecms-cli');
      done();
    });
  });

  // 添加更多测试用例
});
