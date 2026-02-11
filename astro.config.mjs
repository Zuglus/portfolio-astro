import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false, // @tailwind base подключается вручную в src/styles/global.css
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