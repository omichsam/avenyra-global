import { describe, expect, it } from 'vitest'
import { byOrder, moveItem } from './ordering'

const items = (...orders: number[]) => orders.map((order_index, i) => ({ id: String.fromCharCode(97 + i), order_index }))

async function savesFor(list: ReturnType<typeof items>, index: number, delta: -1 | 1) {
  const saves: string[] = []
  await moveItem(list, index, delta, async (id, orderIndex) => { saves.push(`${id}=${orderIndex}`) })
  return saves.sort()
}

describe('byOrder', () => {
  it('sorts by order_index without mutating the input', () => {
    const list = items(2, 0, 1)
    expect(byOrder(list).map((item) => item.id)).toEqual(['b', 'c', 'a'])
    expect(list.map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('moveItem', () => {
  it('swaps neighbours and saves only what changed', async () => {
    expect(await savesFor(items(0, 1, 2), 1, -1)).toEqual(['a=1', 'b=0'])
  })

  it('renumbers lists where every item shares order_index 0', async () => {
    // a stays at 0; c moves above b.
    expect(await savesFor(items(0, 0, 0), 2, -1)).toEqual(['b=2', 'c=1'])
  })

  it('closes gaps in the numbering', async () => {
    expect(await savesFor(items(0, 5, 9), 0, 1)).toEqual(['a=1', 'b=0', 'c=2'])
  })

  it('does nothing when moving past either end', async () => {
    expect(await savesFor(items(0, 1), 0, -1)).toEqual([])
    expect(await savesFor(items(0, 1), 1, 1)).toEqual([])
  })
})
