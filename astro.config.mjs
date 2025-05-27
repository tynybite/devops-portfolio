import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        'typed.js': 'node_modules/typed.js/dist/typed.umd.js'
      }
    }
  }
});