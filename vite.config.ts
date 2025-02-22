import dts from 'vite-plugin-dts';
import path from 'path';
import { defineConfig, UserConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [dts({ insertTypesEntry: true, rollupTypes: true })],
  optimizeDeps: {
    exclude: ['esbuild'],
  },
  build: {
    sourcemap: true,
    minify: false, // Disables minification for debugging

    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MobxVisualizer',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format}.js`,
    },
  },
} satisfies UserConfig);
