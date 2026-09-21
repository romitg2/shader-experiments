import Link from 'next/link'
import { registry } from '@waterlystudios/creativeio/registry'
import { ComponentPreview } from './ComponentPreview'
import { groupByCategory } from '../lib/categories'

export default function ComponentsPage() {
  const sections = groupByCategory(registry)

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <Link href="/" style={{ fontSize: 13, opacity: 0.6, textDecoration: 'none' }}>
        ← creatio
      </Link>
      <h1 style={{ fontSize: 28, margin: '16px 0 8px' }}>All components</h1>
      <p style={{ opacity: 0.7, marginBottom: 40 }}>
        A growing catalog of GPU shader components built on React Three Fiber.
      </p>

      {sections.map((section) => (
        <div key={section.category} style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{section.label}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {section.items.map((meta) => (
              <Link
                key={meta.id}
                href={`/c/${meta.id}`}
                style={{
                  display: 'block',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#161616',
                  border: '1px solid #2a2a2a',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ height: 180, background: '#000' }}>
                  <ComponentPreview id={meta.id} />
                </div>
                <div style={{ padding: 20 }}>
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
