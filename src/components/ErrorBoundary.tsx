import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

// Catches render errors anywhere below it so a bug shows a recoverable message
// instead of a blank white page. This is also the place to report errors to a
// monitoring service once one is chosen.
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="form-page">
        <section className="form-card" role="alert">
          <a href="/" className="form-brand">Avenyra Global</a>
          <h1>Something went wrong</h1>
          <p>An unexpected error stopped this page from loading. Reloading usually fixes it. If it keeps happening, email info@avenyraglobal.com.</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 20 }}>
            <button type="button" className="error-reload" onClick={() => window.location.reload()}>Reload page</button>
            <a href="/">Go to homepage</a>
          </div>
        </section>
      </main>
    )
  }
}
