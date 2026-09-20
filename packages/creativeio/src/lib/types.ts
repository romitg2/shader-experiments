import type { ComponentType } from 'react'

export interface ComponentMeta {
  id: string
  name: string
  category: string
  tags: string[]
  description: string
  Component: ComponentType<any>
}
