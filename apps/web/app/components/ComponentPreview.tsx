'use client'

import type { CSSProperties } from 'react'
import { components } from '@waterlystudios/creativeio'

export function ComponentPreview({
  id,
  style,
}: {
  id: string
  style?: CSSProperties
}) {
  const Component = components[id]
  if (!Component) return null

  return <Component style={{ width: '100%', height: '100%', ...style }} />
}
