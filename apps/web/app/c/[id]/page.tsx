import Link from 'next/link'
import { notFound } from 'next/navigation'
import { registry } from '@waterlystudios/creativeio/registry'
import { ComponentPreview } from '../../components/ComponentPreview'

export function generateStaticParams() {
  return registry.map((meta) => ({ id: meta.id }))
}

export default async function ComponentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const meta = registry.find((entry) => entry.id === id)
  if (!meta) notFound()

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          maxWidth: 480,
          textAlign: 'center',
          fontFamily: 'monospace',
          color: '#fff',
          background: '#222',
          padding: '8px 16px',
          borderRadius: 4,
        }}
      >
        <strong>{meta.name}</strong>
        <div style={{ opacity: 0.8, fontSize: 12, marginTop: 4 }}>{meta.description}</div>
      </div>

      <Link
        href="/components"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          fontFamily: 'monospace',
          color: '#fff',
          background: '#222',
          padding: '8px 12px',
          borderRadius: 4,
          textDecoration: 'none',
        }}
      >
        ← All components
      </Link>

      <ComponentPreview id={id} />
    </div>
  )
}
