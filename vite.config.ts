import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import path from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    hmr: {
      overlay: true,
      host: 'localhost',
    },
  },
  plugins: [
    vue(),
    dts({ insertTypesEntry: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vue3TreeMaster',
      fileName: 'vue3-tree-master',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  css: {
    devSourcemap: false,
  },
});
