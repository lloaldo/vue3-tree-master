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
      // Forzar HMR para detectar cambios más rápido
      clientPort: 24678,
    },
    watch: {
      usePolling: true, // Detecta cambios en sistemas con problemas de notificación
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
    sourcemap: false, // Desactiva source maps en producción
    emptyOutDir: true, // Limpia el directorio 'dist' antes de cada build
    outDir: 'dist',
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
        // Agrega hash para evitar problemas de caché en producción
        entryFileNames: 'vue3-tree-master-[hash].js',
      },
    },
  },
  css: {
    devSourcemap: false, // Desactiva source maps para CSS en desarrollo
  },
});