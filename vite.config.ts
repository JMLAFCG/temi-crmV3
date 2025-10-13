import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  logLevel: 'warn',
  build: {
    sourcemap: true,
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          forms: ['react-hook-form'],
          maps: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
});
