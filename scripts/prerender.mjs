// Turns the public pages into real HTML after `vite build`, so search engines
// and link previews (WhatsApp, LinkedIn…) see content and the right title on
// every page instead of an empty <div id="root">.
//
// Output, all in dist/:
//   index.html, partners.html, legal/<slug>.html  prerendered pages (served
//                                                  via cleanUrls in vercel.json)
//   app.html     the empty app shell, served for every other route (dashboards,
//                login…) by the vercel.json rewrite; marked noindex
//   sitemap.xml  indexable prerendered pages
//
// Runs as part of `npm run build`; needs the SSR bundle in dist-server/.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const server = await import(pathToFileURL(path.join(root, 'dist-server', 'entry-server.js')).href)
const { render, PRERENDER_ROUTES, structuredData, SITE_URL, DEFAULT_DESCRIPTION, fullTitle, canonicalUrl } = server

const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')
const ROOT_DIV = '<div id="root"></div>'
if (!template.includes(ROOT_DIV)) throw new Error(`prerender: ${ROOT_DIV} not found in dist/index.html`)

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Replaces one tag in the head, failing the build if index.html changed shape
// so a page never silently ships with the homepage's title or canonical.
function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`prerender: ${label} tag not found in dist/index.html`)
  return html.replace(pattern, replacement)
}

function withHead(html, pathname, meta) {
  const title = escapeAttr(fullTitle(meta))
  const description = escapeAttr(meta.description ?? DEFAULT_DESCRIPTION)
  const url = canonicalUrl(pathname)
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, 'title')
  html = replaceTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`, 'description')
  html = replaceTag(html, /<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="${meta.noindex ? 'noindex, follow' : 'index, follow'}" />`, 'robots')
  html = replaceTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, 'canonical')
  html = replaceTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`, 'og:title')
  html = replaceTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`, 'og:description')
  html = replaceTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`, 'og:url')
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`, 'twitter:title')
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`, 'twitter:description')
  return html
}

// 1. The app shell for client-only routes. It must stay empty, or the browser
//    would try to hydrate e.g. /dashboard onto homepage HTML.
let shell = replaceTag(template, /<meta name="robots" content="[^"]*"\s*\/?>/, '<meta name="robots" content="noindex" />', 'robots')
shell = shell.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/?>/, '')
await fs.writeFile(path.join(dist, 'app.html'), shell)

// 2. One HTML file per public page, each with its structured data
//    (organization and website on the homepage, breadcrumbs elsewhere).
function jsonLdTags(pathname, meta) {
  return structuredData(pathname, meta)
    .map((block) => `    <script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`)
    .join('\n')
}
for (const { path: pathname, meta } of PRERENDER_ROUTES) {
  const appHtml = render(pathname)
  let html = withHead(template, pathname, meta).replace(ROOT_DIV, `<div id="root">${appHtml}</div>`)
  if (!meta.noindex) html = html.replace('</head>', `${jsonLdTags(pathname, meta)}\n  </head>`)
  const file = pathname === '/' ? path.join(dist, 'index.html') : path.join(dist, `${pathname.slice(1)}.html`)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, html)
  console.log(`prerendered ${pathname.padEnd(36)} → ${path.relative(root, file)}${meta.noindex ? '  (noindex)' : ''}`)
}

// 3. Sitemap of the pages search engines should index.
const today = new Date().toISOString().slice(0, 10)
const urls = PRERENDER_ROUTES.filter((route) => !route.meta.noindex)
  .map((route) => `  <url><loc>${canonicalUrl(route.path)}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')
await fs.writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`sitemap.xml: ${PRERENDER_ROUTES.filter((route) => !route.meta.noindex).length} URLs on ${SITE_URL}`)
