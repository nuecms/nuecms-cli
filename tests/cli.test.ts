import { describe, it, expect, vi } from 'vitest';
import { exec } from 'child_process';

describe('CLI Tests', () => {
  it('should display help message', (done) => {
    exec('nue --help', (error, stdout, stderr) => {
      expect(stdout).toContain('Usage: nue [options] [command]');
      done();
    });
  });

});
