import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'game.i4y.net',
      '.i4y.net'  // Allow all subdomains of i4y.net
    ]
  },
  build: {
    sourcemap: true
  }
});
