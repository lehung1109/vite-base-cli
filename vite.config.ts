import { defineConfig, loadEnv } from "vite";

const index = process.argv.indexOf('--mode');

const mode = index && process.argv[index] || 'production';
const env = loadEnv(mode, __dirname);

const entryFileNames = (chunkInfo: { name: string; }) => {
  return '[name].js';
};

const bannerFileNames = (chunkInfo: { name: string; }) => {
  return '#!/usr/bin/env node';
}

export default defineConfig({
  base: `${env.VITE_BASE_URL}`,
  build: {
    emptyOutDir: true,
    outDir: 'bin',
    sourcemap: true,
    ssr: true,
    rollupOptions: {
      input: [
        'cli/cli.ts',
      ],
      output: {
        entryFileNames,
        banner: bannerFileNames
      }
    }
  },
});
