// Suggested values for free-text location fields. Offered through a <datalist>
// so spellings stay consistent (which makes the admin location filter useful)
// while still allowing anything to be typed.
export const LOCATION_SUGGESTIONS = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Machakos',
  'Nyeri',
  'Meru',
  'Kakamega',
  'Kisii',
  'Kitale',
  'Malindi',
  'Naivasha',
  'Kericho',
  'Embu',
  'Garissa',
  'Remote (Kenya)',
  'Outside Kenya',
]

export const LOCATION_LIST_ID = 'location-suggestions'

// Accepts local (07…, 01…) and international (+254…, +44…) numbers, with
// optional spaces, dashes and brackets. Used as an <input pattern>, which
// browsers compile with the `v` flag, so ( ) - must be escaped in the class.
export const PHONE_PATTERN = String.raw`\+?[0-9\(][0-9\s\-\(\)]{6,19}`

export const PHONE_PLACEHOLDER = '+254 712 345 678'
