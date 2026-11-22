import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Backend-ul accepta cereri doar de la originea din CORS_ORIGIN
  // (http://localhost:5173), deci si dev, si preview folosesc acest port. Cu
  // strictPort, un port ocupat da eroare in loc sa treaca pe alt port, unde
  // cererile ar fi blocate de CORS.
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
