import Link from 'next/link'
import { registry } from '@waterlystudios/creativeio/registry'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>creativeio</h1>
      <p style={{ opacity: 0.7, marginBottom: 32 }}>
        A growing catalog of GPU shader components built on React Three Fiber.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {registry.map((meta) => (
          <Link
            key={meta.id}
            href={`/c/${meta.id}`}
            style={{
              display: 'block',
              padding: 20,
              borderRadius: 12,
              background: '#161616',
              border: '1px solid #2a2a2a',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 6 }}>{meta.category}</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{meta.name}</div>
            <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>{meta.description}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#242424',
                    opacity: 0.7,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
