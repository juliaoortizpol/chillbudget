import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: { pool: 'threads', maxWorkers: 1, environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
});
