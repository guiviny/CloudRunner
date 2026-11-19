type P = { className?: string }

export const StarIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
)

export const CheckIcon = ({ className }: P) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export const DumbbellIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <rect x="2" y="9" width="3" height="6" rx="1" />
    <rect x="5" y="6" width="3.5" height="12" rx="1.2" />
    <rect x="8.5" y="10.5" width="7" height="3" />
    <rect x="15.5" y="6" width="3.5" height="12" rx="1.2" />
    <rect x="19" y="9" width="3" height="6" rx="1" />
  </svg>
)

export const ChestIcon = ({ className, open }: P & { open?: boolean }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect x="6" y="20" width="36" height="22" rx="3" fill={open ? 'var(--color-line)' : '#B86A00'} />
    {open ? (
      <path d="M6 20l4-10h28l4 10z" fill="var(--color-surface-2)" />
    ) : (
      <rect x="4" y="10" width="40" height="12" rx="4" fill="var(--color-gold)" />
    )}
    <rect
      x="20"
      y="18"
      width="8"
      height="10"
      rx="2"
      fill={open ? 'var(--color-locked)' : 'var(--color-gold)'}
      stroke={open ? 'var(--color-muted)' : '#B86A00'}
      strokeWidth="2"
    />
  </svg>
)

export const TrophyIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M7 3h10v2h3v3a4 4 0 01-4 4h-.3A5 5 0 0113 14.9V18h3v3H8v-3h3v-3.1A5 5 0 018.3 12H8a4 4 0 01-4-4V5h3zm0 4H6v1a2 2 0 001 1.7zm10 0v2.7A2 2 0 0018 8V7z" />
  </svg>
)

export const HeartIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 21s-7.5-4.6-9.5-9.3C1 8.1 3.3 4.5 7 4.5c2 0 3.5 1.1 5 2.8 1.5-1.7 3-2.8 5-2.8 3.7 0 6 3.6 4.5 7.2C19.5 16.4 12 21 12 21z" />
  </svg>
)

export const CloseIcon = ({ className }: P) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const PlayIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M8 5.5v13a1 1 0 001.5.9l10.5-6.5a1 1 0 000-1.8L9.5 4.6A1 1 0 008 5.5z" />
  </svg>
)

export const BookIcon = ({ className }: P) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinejoin="round"
  >
    <path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5zM20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5z" />
  </svg>
)

export const ExternalIcon = ({ className }: P) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
  </svg>
)
