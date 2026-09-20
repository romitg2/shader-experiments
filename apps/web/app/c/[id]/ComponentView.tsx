'use client'

import { components } from '@waterlystudios/creativeio'

export function ComponentView({ id }: { id: string }) {
  const Component = components[id]
  if (!Component) return null

  return <Component style={{ width: '100%', height: '100%' }} />
}
