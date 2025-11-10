import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true,
    hmr: {
      clientPort: 5173
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',  // Listen on all interfaces
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    sourcemap: true
  }
});
