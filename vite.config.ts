import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/google-books': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-books/, '')
      },
      '/book-cover': {
        target: 'https://books.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/book-cover/, '')
      }
    }
  }
});