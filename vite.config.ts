import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_URL || '/';

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 5173,
    },
  };
});
