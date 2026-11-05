// Builds the site for GitHub Pages, which serves it from a subfolder:
//   https://omichsam.github.io/avenyra-global/
//
// Same as `npm run build`, with BASE_PATH set so every asset, image and route
// is prefixed with /avenyra-global/. Then adds what GitHub Pages needs:
//   404.html   copy of the app shell, so refreshing a client-only route
//              (e.g. /avenyra-global/dashboard) still loads the app
//   .nojekyll  serve files as-is (no Jekyll processing)
//
// Usage: npm run build:pages   (override the folder with BASE_PATH=/name/)

import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const env = { ...process.env, BASE_PATH: process.env.BASE_PATH || '/avenyra-global/' }

execSync('npm run build', { cwd: root, env, stdio: 'inherit' })

await fs.copyFile(path.join(dist, 'app.html'), path.join(dist, '404.html'))
await fs.writeFile(path.join(dist, '.nojekyll'), '')
console.log(`GitHub Pages build ready in dist/ (base ${env.BASE_PATH})`)
