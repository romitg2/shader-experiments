import type { ComponentInfo } from '@waterlystudios/creativeio/registry'

/** Human-friendly section headings for each component category. */
const CATEGORY_LABELS: Record<string, string> = {
  'smoke-fluid': 'Fluid Simulation',
  backgrounds: 'Backgrounds',
  transitions: 'Transitions',
  'text-effects': 'Text Effects',
  'hover-effects': 'Hover Effects',
}

/** Display order for category sections — fluid-family components first. */
const CATEGORY_ORDER = ['smoke-fluid', 'backgrounds', 'transitions', 'hover-effects', 'text-effects']

export interface CategorySection {
  category: string
  label: string
  items: ComponentInfo[]
}

/**
 * Groups registry entries by category into ordered sections, so the fluid
 * family (fluid, color-smoke, pixel-ink, city-grid — all built on the same
 * GPU velocity/density sim) reads as one coherent group instead of being
 * scattered through a flat list, same for every other category.
 */
export function groupByCategory(registry: ComponentInfo[]): CategorySection[] {
  const byCategory = new Map<string, ComponentInfo[]>()
  for (const meta of registry) {
    const list = byCategory.get(meta.category) ?? []
    list.push(meta)
    byCategory.set(meta.category, list)
  }

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
    ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
  ]

  return orderedCategories.map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    items: byCategory.get(category)!,
  }))
}
