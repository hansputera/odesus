import { defineConfig } from 'tsup';

export default defineConfig({
    entryPoints: ['src/index.ts'],
    format: ['esm', 'cjs'],
    splitting: true,
    dts: true,
    clean: true,
    minify: true,
    target: 'es2019',
    platform: 'node',
});
