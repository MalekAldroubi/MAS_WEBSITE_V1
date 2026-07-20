import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync } from 'fs'

const pages = (dir, prefix) => Object.fromEntries(
  readdirSync(resolve(__dirname, dir))
    .filter((file) => file.endsWith('.html'))
    .map((file) => [`${prefix}-${file.replace('.html', '')}`, resolve(__dirname, dir, file)])
)

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        markets: resolve(__dirname, 'markets.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        ...pages('fields', 'field'),
        ...pages('ar', 'ar'),
        ...pages('ar/fields', 'ar-field'),
      },
    },
  },
})
