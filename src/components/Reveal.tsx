import { useEffect, useRef, useState, type CSSProperties, type FormEventHandler, type ReactNode } from 'react'
import styles from './LandingPage.module.css'

interface RevealProps {
  as?: 'div' | 'form' | 'section'
  id?: string
  className?: string
  style?: CSSProperties
  role?: string
  children: ReactNode
  onSubmit?: FormEventHandler<HTMLFormElement>
  /** Milliseconds to wait before fading in, for staggering a row of items. */
  delay?: number
}

// 'static': visible with no animation. Every element starts here, both in the
//   prerendered HTML and on first client render, so hydration matches and the
//   content is readable without JavaScript.
// 'hidden' → 'shown': elements that turn out to be below the fold on load are
//   hidden, then fade in when scrolled into view.
type Phase = 'static' | 'hidden' | 'shown'

export default function Reveal({
  as = 'div',
  id,
  className,
  style,
  role,
  children,
  onSubmit,
  delay,
}: RevealProps) {
  const elementRef = useRef<HTMLElement | null>(null)
  const [phase, setPhase] = useState<Phase>('static')

  useEffect(() => {
    const element = elementRef.current
    if (!element || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let first = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false
          // Already on screen at load: leave it alone, no animation.
          if (entry.isIntersecting) { observer.disconnect(); return }
          setPhase('hidden')
          return
        }
        if (entry.isIntersecting) {
          setPhase('shown')
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const combinedClassName = [
    phase !== 'static' ? styles.reveal : '',
    phase === 'shown' ? styles.revealIn : '',
    className ?? '',
  ].filter(Boolean).join(' ')
  const sharedProps = {
    id,
    className: combinedClassName || undefined,
    // A per-item delay lets a row of cards fade in one after another.
    style: delay ? ({ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties) : style,
    role,
  }

  if (as === 'form') {
    return <form {...sharedProps} ref={(element) => { elementRef.current = element }} onSubmit={onSubmit}>{children}</form>
  }
  if (as === 'section') {
    return <section {...sharedProps} ref={(element) => { elementRef.current = element }}>{children}</section>
  }
  return <div {...sharedProps} ref={(element) => { elementRef.current = element }}>{children}</div>
}
