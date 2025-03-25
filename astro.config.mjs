// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://casacaida.co',
  integrations: [tailwind()],
  output: 'static',
  build: {
    // Esto es opcional, para optimizar más la carga
    assets: 'assets',
    inlineStylesheets: 'auto'
  },
  vite: {
    // Opciones de Vite para optimizar el build
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
