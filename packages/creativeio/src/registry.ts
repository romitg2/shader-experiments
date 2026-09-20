import type { ComponentMeta } from './lib/types'
import { fluidMeta } from './components/fluid/meta'

/**
 * Every shipped component's catalog entry, in one place. Adding a new component
 * means adding its meta import + array entry here, and a re-export in index.ts —
 * nothing else in this file changes.
 */
export const registry: ComponentMeta[] = [fluidMeta]
