import { Link, useParams } from 'react-router-dom'
import { registry } from '@waterlystudios/creativeio'

export default function ComponentPage() {
  const { id } = useParams()
  const meta = registry.find((entry) => entry.id === id)

  if (!meta) {
    return (
      <div style={{ padding: 24 }}>
        <p>No component named "{id}".</p>
        <Link to="/">Back to gallery</Link>
      </div>
    )
  }

  const { Component } = meta

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
        to="/"
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
        ← Gallery
      </Link>

      <Component style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
