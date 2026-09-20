import type { ComponentType } from 'react'

/** Plain catalog data for a component — safe to import anywhere, including
 * React Server Components, since it never touches the component's actual
 * (client-only) implementation. */
export interface ComponentInfo {
  id: string
  name: string
  category: string
  tags: string[]
  description: string
}

/** ComponentInfo plus the actual component reference — only importable from a
 * client boundary, since every component here uses hooks/canvas. */
export interface ComponentMeta extends ComponentInfo {
  Component: ComponentType<any>
}
