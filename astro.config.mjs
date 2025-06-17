import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    })
  ],
  vite: {
    build: {
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            alpine: ['alpinejs'],
          }
        }
      }
    }
  }
});