import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // necesario para exponer el dev server desde WSL al navegador de Windows
    port: 5173,
  },
});
