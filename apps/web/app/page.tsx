import Link from 'next/link'
import { registry } from '@waterlystudios/creativeio/registry'
import { ComponentPreview } from './components/ComponentPreview'

const BENTO_FILLER_AREAS = ['bento-side1', 'bento-side2', 'bento-b1', 'bento-b2', 'bento-b3']

// Roadmap items not shipped yet — padding for the remaining bento slots once
// real components run out. As components ship, they push these out of the
// grid automatically (see `fillers` below); the full roadmap still lives in
// the README regardless of how many fit here.
const comingSoon = [
  { name: 'Flow Fields', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { name: 'Reaction-Diffusion', gradient: 'linear-gradient(135deg, #1f1533, #0f2027)' },
  { name: 'Water Ripples', gradient: 'linear-gradient(135deg, #0f2027, #203a43)' },
  { name: 'Trails', gradient: 'linear-gradient(135deg, #2b1055, #1a1a2e)' },
  { name: 'Cellular Automata', gradient: 'linear-gradient(135deg, #232526, #414345)' },
]

export default function LandingPage() {
  const [featured, ...restReal] = registry
  const fillers = [
    ...restReal.map((meta) => ({ kind: 'real' as const, meta })),
    ...comingSoon.map((item) => ({ kind: 'soon' as const, item })),
  ].slice(0, BENTO_FILLER_AREAS.length)

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

          {fillers.map((filler, i) => {
            const area = BENTO_FILLER_AREAS[i]
            if (filler.kind === 'real') {
              return (
                <Link key={filler.meta.id} href={`/c/${filler.meta.id}`} className={`bento-card ${area}`}>
                  <div className="bento-card-media">
                    <ComponentPreview id={filler.meta.id} />
                  </div>
                  <div className="bento-label">
                    <span>{filler.meta.name}</span>
                  </div>
                </Link>
              )
            }
            return (
              <div key={filler.item.name} className={`bento-card ${area}`} style={{ background: filler.item.gradient }}>
                <div className="bento-label">
                  <span>{filler.item.name}</span>
                  <span className="bento-badge">Soon</span>
                </div>
              </div>
            )
          })}
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
