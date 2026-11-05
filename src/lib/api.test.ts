import { describe, expect, it } from 'vitest'
import { formatErrorDetail, UPLOAD_MAX_BYTES, validateUpload } from './api'

describe('formatErrorDetail', () => {
  it('passes plain string details through', () => {
    expect(formatErrorDetail('Incorrect email or password')).toBe('Incorrect email or password')
  })

  // Shape captured from the live backend's 422 response to an invalid signup.
  it('turns FastAPI validation errors into readable sentences', () => {
    const detail = [
      { type: 'value_error', loc: ['body', 'email'], msg: 'value is not a valid email address: An email address must have an @-sign.' },
      { type: 'string_too_short', loc: ['body', 'full_name'], msg: 'String should have at least 1 character' },
      { type: 'string_too_short', loc: ['body', 'password'], msg: 'String should have at least 8 characters' },
    ]
    expect(formatErrorDetail(detail)).toBe(
      'Email: value is not a valid email address: An email address must have an @-sign. ' +
        'Full name: String should have at least 1 character. ' +
        'Password: String should have at least 8 characters',
    )
  })

  it('uses the innermost named field for nested locations', () => {
    const detail = [{ loc: ['body', 'answers', 0, 'response_text'], msg: 'String should have at least 1 character' }]
    expect(formatErrorDetail(detail)).toBe('Response text: String should have at least 1 character')
  })

  it('strips the "Value error, " prefix from custom validators', () => {
    expect(formatErrorDetail([{ loc: ['body'], msg: 'Value error, Passwords must differ' }])).toBe('Passwords must differ')
  })

  it('returns an empty string for anything else', () => {
    expect(formatErrorDetail(undefined)).toBe('')
    expect(formatErrorDetail({ unexpected: true })).toBe('')
  })
})

describe('validateUpload', () => {
  const file = (name: string, size: number, type = '') => new File([new Uint8Array(size)], name, { type })

  it('accepts PDF and Word documents', () => {
    expect(validateUpload(file('cv.pdf', 1000, 'application/pdf'))).toBeNull()
    expect(validateUpload(file('CV.DOCX', 1000))).toBeNull()
  })

  // Some browsers report an empty type for .doc files; the extension decides.
  it('accepts a .doc with no reported content type', () => {
    expect(validateUpload(file('resume.doc', 1000, ''))).toBeNull()
  })

  it('rejects other file types', () => {
    expect(validateUpload(file('photo.jpg', 1000, 'image/jpeg'))).toMatch(/PDF or Word/)
    expect(validateUpload(file('noextension', 1000))).toMatch(/PDF or Word/)
  })

  it('rejects empty and oversized files', () => {
    expect(validateUpload(file('cv.pdf', 0))).toMatch(/empty/)
    expect(validateUpload(file('cv.pdf', UPLOAD_MAX_BYTES + 1))).toMatch(/maximum size is 10 MB/)
  })
})
