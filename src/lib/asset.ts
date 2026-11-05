// Prefixes a file in public/ with the site's base path, so images still load
// when the site is served from a subfolder (e.g. GitHub Pages at
// /avenyra-global/). With the default base ("/") this returns the path as-is.
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}

// Router basename: the base path without its trailing slash ("" at the root).
export const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');
