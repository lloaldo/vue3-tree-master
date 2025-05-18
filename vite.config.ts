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
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist/types',
      include: ['src/**/*'],
      exclude: ['src/**/*.spec.ts'], // Excluye archivos de prueba si los hay
      rollupTypes: true,
      tsconfigPath: './tsconfig.json', // Especifica el tsconfig explícitamente
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false,
    emptyOutDir: true,
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vue3TreeMaster',
      fileName: (format) => `vue3-tree-master.${format}.js`, // Nombres fijos por formato
      formats: ['es', 'cjs', 'umd'], // Especifica todos los formatos
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.type === 'asset' && (assetInfo.name || '').endsWith('.css')) {
            return 'style.css';
          }
          return '[name][extname]';
        },
        exports: 'named',
        preserveModules: false,
      },
    },
  },
  css: {
    devSourcemap: false,
  },
});