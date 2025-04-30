// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://casacaida.co',
  output: 'static',
  integrations: [
    sitemap() // Sin configuración adicional, para mantener el comportamiento actual
  ],
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            d3: ['d3-selection', 'd3-array', 'd3-scale', 'd3-shape', 'd3-axis', 'd3-fetch'],
            anime: ['animejs']
          }
        }
      }
    }
  }
});
