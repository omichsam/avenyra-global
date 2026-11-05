import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { canonicalUrl, DEFAULT_DESCRIPTION, fullTitle, type PageMeta } from './seo'

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

// Keeps the tab title, description, canonical URL and social tags in step with
// the current page as people navigate. Public pages also get these baked into
// their prerendered HTML (scripts/prerender.mjs) for crawlers that don't run JS.
// `noindex` keeps private screens (dashboards, auth forms) out of search.
export function usePageMeta(meta: PageMeta) {
  const { pathname } = useLocation()
  const { title, description, noindex = false } = meta

  useEffect(() => {
    const titleText = fullTitle({ title })
    const url = canonicalUrl(pathname)
    document.title = titleText
    setMeta('meta[name="description"]', 'name', 'description', description ?? DEFAULT_DESCRIPTION)
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('meta[property="og:title"]', 'property', 'og:title', titleText)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description ?? DEFAULT_DESCRIPTION)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setCanonical(url)
  }, [title, description, noindex, pathname])
}
