import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/usePageMeta'

export default function NotFoundPage() {
  usePageMeta({ title: 'Page not found', noindex: true })
  return (
    <main className="form-page">
      <section className="form-card">
        <Link to="/" className="form-brand">Avenyra Global</Link>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has moved.</p>
        <Link to="/">Back to home</Link>
      </section>
    </main>
  )
}
