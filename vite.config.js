import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Backend-ul accepta cereri doar de la originea din CORS_ORIGIN
// (http://localhost:5173), deci si dev, si preview folosesc acest port. Cu
// strictPort, un port ocupat da eroare in loc sa treaca pe alt port, unde
// cererile ar fi blocate de CORS.
const PORT_FRONTEND = { port: 5173, strictPort: true };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: PORT_FRONTEND,
  preview: PORT_FRONTEND,
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
