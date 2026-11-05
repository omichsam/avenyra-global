import { useId } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// export function LogoMark({ size = 38, accentColor = '#D9793F' }: IconProps & { accentColor?: string }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
//       <circle cx="20" cy="20" r="14" stroke={accentColor} strokeWidth="2.4" />
//       <circle cx="34" cy="9" r="2.6" fill={accentColor} />
//       <path
//         d="M20 34 L26 28 M20 34 L24 33.5"
//         stroke={accentColor}
//         strokeWidth="2.4"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <text
//         x="20"
//         y="26"
//         fontFamily="Lora, serif"
//         fontWeight={800}
//         fontSize="18"
//         fill="#2E2661"
//         textAnchor="middle"
//       >
//         A
//       </text>
//     </svg>
//   );
// }

// Brand mark: an open "avenue" arc (dot → arrowhead) around the letter A.
// The A uses currentColor, so it follows the text colour of wherever the
// logo sits (indigo in the header, white on the dark footer).
export function LogoMark({ size = 40, accentColor = '#DF6E28', className }: IconProps & { accentColor?: string }) {
  const gradientId = `logo-arc-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="160" y1="40" x2="150" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={accentColor} />
          <stop offset="1" stopColor="#D83D78" />
        </linearGradient>
      </defs>
      <path
        d="M156.7 52.4A74 74 0 1 0 158.3 145.6"
        stroke={`url(#${gradientId})`}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <circle cx="156.7" cy="52.4" r="13" fill={accentColor} />
      <path d="M170.6 129.8L166.8 157.4L144.8 140.2Z" fill="#D83D78" stroke="#D83D78" strokeWidth="6" strokeLinejoin="round" />
      <text
        x="100"
        y="134"
        fontFamily="Plus Jakarta Sans, Inter, sans-serif"
        fontWeight={800}
        fontSize="98"
        fill="currentColor"
        textAnchor="middle"
      >
        A
      </text>
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CoinsIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TeamIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5Zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
    </svg>
  );
}

export function GoogleIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 34.9 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C39.9 37.2 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5Z" />
    </svg>
  );
}

export function EyeIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function EyeOffIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.3 5.3A11.6 11.6 0 0 1 12 5c7 0 11 7 11 7a13.4 13.4 0 0 1-3.1 3.8M6.1 6.1C3.4 7.9 1 12 1 12a13.6 13.6 0 0 0 4.2 4.9A11.5 11.5 0 0 0 12 19c1 0 2-.1 2.9-.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m3 6 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function LinkedInIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 9h4v11H4V9Zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm4 6h3.8v1.6h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V20h-4v-6.1c0-1.46-.03-3.34-2.1-3.34-2.1 0-2.42 1.56-2.42 3.24V20h-4V9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TwitterIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.9 3.7A11.5 11.5 0 0 1 3.6 4.6a4 4 0 0 0 1.3 5.4c-.7 0-1.3-.2-1.8-.5v.1a4 4 0 0 0 3.3 4 4 4 0 0 1-1.8.1 4 4 0 0 0 3.8 2.8A8 8 0 0 1 2 18.5a11.4 11.4 0 0 0 6.2 1.8c7.5 0 11.6-6.4 11.6-11.9v-.5c.8-.6 1.5-1.3 2.1-2.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PinIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function CompassIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h3.5l1.8 4.4-2.3 1.4a11 11 0 0 0 6.2 6.2l1.4-2.3L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EnvelopeIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
