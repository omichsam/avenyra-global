import { describe, expect, it } from 'vitest'
import { PHONE_PATTERN } from './locations'

// Browsers compile <input pattern> as ^(?:pattern)$ with the `v` flag, so test
// it the same way; a pattern that's invalid under `v` is silently ignored.
const phone = new RegExp(`^(?:${PHONE_PATTERN})$`, 'v')

describe('PHONE_PATTERN', () => {
  it.each(['+254 712 345 678', '0712345678', '0712-345-678', '(020) 222-3344', '+44 20 7946 0958'])('accepts %s', (value) => {
    expect(phone.test(value)).toBe(true)
  })

  it.each(['abc', '12', '+(', '0712345678901234567890', '0712 ABC 678'])('rejects %s', (value) => {
    expect(phone.test(value)).toBe(false)
  })
})
