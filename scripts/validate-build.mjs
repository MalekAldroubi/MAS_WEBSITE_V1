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
  if (canonical) {
    if (!canonical.startsWith('https://mascaregroup.com/')) fail(`${label}: canonical uses an unexpected origin`)
    if (label !== '404.html') pageCanonicals.add(canonical)
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
  for (const canonical of pageCanonicals) {
    if (!locations.has(canonical)) fail(`Sitemap is missing ${canonical}`)
  }
  for (const location of locations) {
    if (!pageCanonicals.has(location)) fail(`Sitemap URL has no built page: ${location}`)
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
