import Link from 'next/link'
import { registry } from '@waterlystudios/creativeio/registry'
import { ComponentPreview } from './components/ComponentPreview'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 24px 0',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>creatio</span>
        <nav style={{ display: 'flex', gap: 24, fontSize: 14, opacity: 0.8 }}>
          <Link href="/components" style={{ textDecoration: 'none' }}>
            Components
          </Link>
          <a
            href="https://github.com/romitg2/shader-experiments"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            GitHub
          </a>
        </nav>
      </header>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px 56px' }}>
        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            maxWidth: 720,
          }}
        >
          Shader components, ready to drop in.
        </h1>
        <p style={{ fontSize: 18, opacity: 0.7, marginTop: 20, maxWidth: 560, lineHeight: 1.6 }}>
          Production-ready GPU shader components for React Three Fiber. Preview them live, then
          grab the code or get premium access.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <Link
            href="/components"
            style={{
              padding: '12px 22px',
              borderRadius: 8,
              background: '#fff',
              color: '#000',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Browse components
          </Link>
          <a
            href="https://github.com/romitg2/shader-experiments"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '12px 22px',
              borderRadius: 8,
              border: '1px solid #333',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 96px' }}>
        <div className="uniform-grid">
          {registry.map((meta) => (
            <Link key={meta.id} href={`/c/${meta.id}`} className="grid-card">
              <div className="grid-card-media">
                <ComponentPreview id={meta.id} />
              </div>
              <div className="grid-label">
                <span>{meta.name}</span>
                <span className="grid-badge">{meta.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 24px 48px',
          fontSize: 13,
          opacity: 0.5,
        }}
      >
        creatio — a growing catalog of GPU shader components.
      </footer>
    </div>
  )
}
