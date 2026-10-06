import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000
  },
  build: {
    // same deploy folder as the old UI
    outDir: '../output',
    // output also holds files that are not part of this build, so it is not cleaned
    emptyOutDir: false,
    chunkSizeWarningLimit: 2000
  }
});
