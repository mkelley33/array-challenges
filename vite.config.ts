import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const CATALOG_DIR = 'src/data/challenges/';

/**
 * Challenges are authored in TypeScript but served from db.json, and the API
 * does not watch that file, so an edit made while the dev server runs is
 * invisible to the running app. Announce the edit so the app can say so.
 */
function catalogStaleNotifier(): Plugin {
  return {
    apply: 'serve',
    configureServer(server) {
      server.watcher.on('change', (changedPath) => {
        const file = path.relative(server.config.root, changedPath).split(path.sep).join('/');
        if (!file.startsWith(CATALOG_DIR) || !file.endsWith('.ts') || file.endsWith('.test.ts')) {
          return;
        }
        server.hot.send({ data: { file }, event: 'catalog:stale', type: 'custom' });
      });
    },
    name: 'catalog-stale-notifier',
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), catalogStaleNotifier()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
    },
  },
});
