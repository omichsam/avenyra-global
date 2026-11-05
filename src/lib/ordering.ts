// Helpers for admin lists that are ordered by an `order_index` field
// (career fields, screening questions, leadership, FAQ).

interface Ordered {
  id: string
  order_index: number
}

export function byOrder<T extends Ordered>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

// Moves items[index] by `delta` places and saves the new positions. Every item
// whose position changed is renumbered to its array index, which also repairs
// lists where several items share the same order_index (e.g. all 0).
export async function moveItem<T extends Ordered>(
  items: T[],
  index: number,
  delta: -1 | 1,
  save: (id: string, orderIndex: number) => Promise<unknown>,
) {
  const target = index + delta
  if (target < 0 || target >= items.length) return
  const next = [...items]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved)
  await Promise.all(next.map((item, position) => (item.order_index === position ? null : save(item.id, position))))
}
