import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'

const root = resolve('dist')
const failures = []
const pageCanonicals = new Set()

const fail = (message) => failures.push(message)
const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name)
  return statSync(path).isDirectory() ? walk(path) : [path]
})

if (!existsSync(root)) {
  console.error('dist/ does not exist. Run npm run build first.')
  process.exit(1)
}

const files = walk(root)
const htmlFiles = files.filter((file) => extname(file) === '.html')

for (const file of files) {
  if (file.endsWith('.DS_Store')) fail(`macOS metadata must not be deployed: ${relative(root, file)}`)
}

const required = [
  '.htaccess', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'favicon.svg', 'favicon.ico',
  'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png',
  'android-chrome-192x192.png', 'android-chrome-512x512.png', 'og-image.png',
  'api/contact.php', 'assets/icons/phosphor.svg',
]

for (const path of required) {
  if (!existsSync(join(root, path))) fail(`Missing required deployment file: ${path}`)
}

const resolvePublicPath = (value, currentFile) => {
  const clean = value.split('#')[0].split('?')[0]
  if (!clean) return null
  if (/^(?:[a-z]+:|\/\/|#)/i.test(clean)) return null
  if (clean.startsWith('/')) return join(root, decodeURIComponent(clean.slice(1)))
  return resolve(dirname(currentFile), decodeURIComponent(clean))
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  const label = relative(root, file)
  const count = (pattern) => [...html.matchAll(pattern)].length

  if (count(/<title>[^<]+<\/title>/gi) !== 1) fail(`${label}: expected exactly one non-empty title`)
  if (count(/<meta\s+name=["']description["'][^>]+>/gi) !== 1) fail(`${label}: expected exactly one description`)
  if (count(/<meta\s+name=["']viewport["'][^>]+>/gi) !== 1) fail(`${label}: expected exactly one viewport`)
  if (count(/<h1(?:\s|>)/gi) !== 1) fail(`${label}: expected exactly one h1`)
  if (!/<html[^>]+lang=["'](?:en|ar)["']/i.test(html)) fail(`${label}: missing supported html lang`)
  if (!/<link[^>]+rel=["']canonical["'][^>]+>/i.test(html)) fail(`${label}: missing canonical URL`)
  if (!/<link[^>]+rel=["']icon["'][^>]+>/i.test(html)) fail(`${label}: missing favicon link`)
  if (!/<meta[^>]+property=["']og:title["'][^>]+>/i.test(html)) fail(`${label}: missing Open Graph title`)
  if (!/<meta[^>]+name=["']twitter:card["'][^>]+>/i.test(html)) fail(`${label}: missing Twitter card`)

  const headingLevels = [...html.matchAll(/<h([1-6])(?:\s|>)/gi)].map((match) => Number(match[1]))
  for (let index = 1; index < headingLevels.length; index += 1) {
    if (headingLevels[index] > headingLevels[index - 1] + 1) {
      fail(`${label}: heading level skips from h${headingLevels[index - 1]} to h${headingLevels[index]}`)
    }
  }

  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1]
  const isNoIndex = /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    || /<meta\s+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html)
  if (canonical) {
    if (!canonical.startsWith('https://mascaregroup.com/')) fail(`${label}: canonical uses an unexpected origin`)
    if (label !== '404.html' && !isNoIndex) pageCanonicals.add(canonical)
  }

  for (const match of html.matchAll(/\b(?:href|src|action)=["']([^"']+)["']/gi)) {
    const value = match[1]
    if (/^(?:https?:|mailto:|tel:|data:|#|\/\/)/i.test(value)) continue
    const target = resolvePublicPath(value, file)
    if (!target) continue
    const candidate = value.endsWith('/') ? join(target, 'index.html') : target
    if (!existsSync(candidate)) fail(`${label}: broken local reference ${value}`)
  }
}

for (const cssFile of files.filter((file) => extname(file) === '.css')) {
  const css = readFileSync(cssFile, 'utf8')
  for (const match of css.matchAll(/url\((?:["'])?([^"')]+)(?:["'])?\)/gi)) {
    const value = match[1]
    if (/^(?:data:|https?:|#)/i.test(value)) continue
    const target = resolvePublicPath(value, cssFile)
    if (target && !existsSync(target)) fail(`${relative(root, cssFile)}: missing CSS asset ${value}`)
  }
}

const spritePath = join(root, 'assets/icons/phosphor.svg')
if (existsSync(spritePath)) {
  const sprite = readFileSync(spritePath, 'utf8')
  const ids = new Set([...sprite.matchAll(/<symbol\s+id=["']([^"']+)["']/g)].map((match) => match[1]))
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    for (const match of html.matchAll(/phosphor\.svg#([^"']+)/g)) {
      if (!ids.has(match[1])) fail(`${relative(root, file)}: missing SVG symbol ${match[1]}`)
    }
  }
}

const sitemapPath = join(root, 'sitemap.xml')
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8')
  const locations = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
  const urlEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1])

  if (/<(?:priority|changefreq)>/i.test(sitemap)) fail('Sitemap contains priority/changefreq values that Google ignores')
  if (!sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) fail('Sitemap is missing the hreflang namespace')

  for (const canonical of pageCanonicals) {
    if (!locations.has(canonical)) fail(`Sitemap is missing ${canonical}`)
  }
  for (const location of locations) {
    if (!pageCanonicals.has(location)) fail(`Sitemap URL has no built page: ${location}`)
  }

  for (const entry of urlEntries) {
    const location = entry.match(/<loc>([^<]+)<\/loc>/)?.[1]
    if (!location) {
      fail('Sitemap URL entry is missing loc')
      continue
    }

    const alternates = new Map([...entry.matchAll(/<xhtml:link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*\/>/g)]
      .map((match) => [match[1], match[2]]))
    const path = new URL(location).pathname
    const english = path.startsWith('/ar/') ? `https://mascaregroup.com${path.slice(3) || '/'}` : location
    const arabic = path.startsWith('/ar/') ? location : `https://mascaregroup.com${path === '/' ? '/ar/' : `/ar${path}`}`

    if (alternates.get('en') !== english) fail(`${location}: incorrect English hreflang`)
    if (alternates.get('ar') !== arabic) fail(`${location}: incorrect Arabic hreflang`)
    if (alternates.get('x-default') !== english) fail(`${location}: incorrect x-default hreflang`)

    const lastModified = entry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
    if (!lastModified || !/^\d{4}-\d{2}-\d{2}$/.test(lastModified)) fail(`${location}: missing or invalid lastmod`)
    if (lastModified && lastModified > new Date().toISOString().slice(0, 10)) fail(`${location}: lastmod is in the future`)

    for (const imageLocation of [...entry.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((match) => match[1])) {
      if (!imageLocation.startsWith('https://mascaregroup.com/')) fail(`${location}: image sitemap URL uses an unexpected origin`)
      const imagePath = join(root, new URL(imageLocation).pathname.slice(1))
      if (!existsSync(imagePath)) fail(`${location}: image sitemap asset does not exist: ${imageLocation}`)
    }
  }
}

const robotsPath = join(root, 'robots.txt')
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8')
  if (!/^Sitemap:\s+https:\/\/mascaregroup\.com\/sitemap\.xml\s*$/mi.test(robots)) {
    fail('robots.txt does not advertise the canonical sitemap URL')
  }
}

const manifestPath = join(root, 'site.webmanifest')
if (existsSync(manifestPath)) {
  try {
    JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    fail(`site.webmanifest is invalid JSON: ${error.message}`)
  }
}

if (failures.length) {
  console.error(`Deployment validation failed with ${failures.length} issue(s):`)
  failures.forEach((message) => console.error(`- ${message}`))
  process.exit(1)
}

console.log(`Deployment validation passed: ${htmlFiles.length} HTML pages, ${files.length} files, ${pageCanonicals.size} sitemap URLs.`)
