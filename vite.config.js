import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync, rmSync } from 'fs'

const SITE_ORIGIN = 'https://mascaregroup.com'

const canonicalPath = (path) => {
  if (path.endsWith('/index.html')) return path.slice(0, -10) || '/'
  return path
}

const languagePaths = (path, isArabic) => {
  if (path === '/404.html' || path.startsWith('/card/')) return null
  const english = isArabic ? (path.replace(/^\/ar(?=\/)/, '') || '/') : path
  const arabic = isArabic ? path : `/ar${path === '/' ? '/' : path}`
  return { english, arabic }
}

const seoPlugin = () => ({
  name: 'mas-production-seo',
  transformIndexHtml: {
    order: 'pre',
    handler(html, context) {
      const path = canonicalPath(context.path || '/index.html')
      const isArabic = /<html[^>]+lang=["']ar["']/i.test(html)
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || 'MAS International Care'
      const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] || ''
      const canonical = `${SITE_ORIGIN}${path}`
      const alternates = languagePaths(path, isArabic)
      const tags = [
        { tag: 'link', attrs: { rel: 'canonical', href: canonical }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: 'any' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#30231b' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'MAS International Care' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:locale', content: isArabic ? 'ar_SA' : 'en_US' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: canonical }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: `${SITE_ORIGIN}/og-image.png` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'MAS International Care logo' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:title', content: title }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:description', content: description }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${SITE_ORIGIN}/og-image.png` }, injectTo: 'head' },
        {
          tag: 'link',
          attrs: isArabic
            ? { rel: 'preload', href: '/fonts/thmanyah-serif-text-regular.otf', as: 'font', type: 'font/otf', crossorigin: '' }
            : { rel: 'preload', href: '/fonts/ibm-plex-sans-arabic-latin-400.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head',
        },
      ]

      if (alternates) {
        tags.push(
          { tag: 'link', attrs: { rel: 'alternate', hreflang: 'en', href: `${SITE_ORIGIN}${alternates.english}` }, injectTo: 'head' },
          { tag: 'link', attrs: { rel: 'alternate', hreflang: 'ar', href: `${SITE_ORIGIN}${alternates.arabic}` }, injectTo: 'head' },
          { tag: 'link', attrs: { rel: 'alternate', hreflang: 'x-default', href: `${SITE_ORIGIN}${alternates.english}` }, injectTo: 'head' },
        )
      }

      return tags
    },
  },
})

const deploymentCleanupPlugin = () => ({
  name: 'mas-deployment-cleanup',
  closeBundle() {
    rmSync(resolve(__dirname, 'dist/.DS_Store'), { force: true })
    rmSync(resolve(__dirname, 'dist/assets/.DS_Store'), { force: true })
  },
})

const pages = (dir, prefix) => Object.fromEntries(
  readdirSync(resolve(__dirname, dir))
    .filter((file) => file.endsWith('.html'))
    .map((file) => [`${prefix}-${file.replace('.html', '')}`, resolve(__dirname, dir, file)])
)

const cardPages = () => Object.fromEntries(
  readdirSync(resolve(__dirname, 'card'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [`card-${entry.name}`, resolve(__dirname, 'card', entry.name, 'index.html')])
)

export default defineConfig({
  plugins: [seoPlugin(), deploymentCleanupPlugin()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        markets: resolve(__dirname, 'markets.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        notFound: resolve(__dirname, '404.html'),
        ...pages('fields', 'field'),
        ...pages('ar', 'ar'),
        ...pages('ar/fields', 'ar-field'),
        ...cardPages(),
      },
    },
  },
})
