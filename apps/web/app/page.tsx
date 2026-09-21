import Link from 'next/link'
import { registry } from '@waterlystudios/creativeio/registry'
import { ComponentPreview } from './components/ComponentPreview'

const comingSoon = [
  { name: 'Flow Fields', area: 'bento-side1', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { name: 'Reaction-Diffusion', area: 'bento-side2', gradient: 'linear-gradient(135deg, #1f1533, #0f2027)' },
  { name: 'Water Ripples', area: 'bento-b1', gradient: 'linear-gradient(135deg, #0f2027, #203a43)' },
  { name: 'Trails', area: 'bento-b2', gradient: 'linear-gradient(135deg, #2b1055, #1a1a2e)' },
  { name: 'Cellular Automata', area: 'bento-b3', gradient: 'linear-gradient(135deg, #232526, #414345)' },
]

export default function LandingPage() {
  const featured = registry[0]

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
        <div className="bento-grid">
          {featured && (
            <Link href={`/c/${featured.id}`} className="bento-card bento-hero">
              <div className="bento-card-media">
                <ComponentPreview id={featured.id} />
              </div>
              <div className="bento-label">
                <span>{featured.name}</span>
              </div>
            </Link>
          )}

          {comingSoon.map((item) => (
            <div key={item.name} className={`bento-card ${item.area}`} style={{ background: item.gradient }}>
              <div className="bento-label">
                <span>{item.name}</span>
                <span className="bento-badge">Soon</span>
              </div>
            </div>
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
