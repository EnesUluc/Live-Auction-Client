interface IconProps {
  name: keyof typeof paths
  size?: number
  className?: string
}

/** Single-path, 24×24 stroke icons — keeps the bundle free of an icon dependency. */
const paths = {
  gavel: 'M14 4 20 10M11 7 17 13M8.5 9.5 3 15l6 6 5.5-5.5M12.5 5.5 18.5 11.5M4 21h8',
  plus: 'M12 5v14M5 12h14',
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  refresh: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM21 21l-4.3-4.3',
  broadcast: 'M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M8.1 16A5.5 5.5 0 0 1 8.1 8M15.9 8a5.5 5.5 0 0 1 0 8M5.3 19a9.5 9.5 0 0 1 0-14M18.7 5a9.5 9.5 0 0 1 0 14',
  history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7.5V12l3 2',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  user: 'M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  moon: 'M20 14.2A8.5 8.5 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  check: 'M20 6 9 17l-5-5',
  alert: 'M12 8v5M12 16.5v.5M12 3 2 20h20L12 3Z',
  link: 'M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 3l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21l1.7-1.7',
  trash: 'M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3',
  x: 'M18 6 6 18M6 6l12 12',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M4.3 5.7 3 13v6h18v-6l-1.3-7.3A2 2 0 0 0 17.7 4H6.3a2 2 0 0 0-2 1.7Z',
  trend: 'M22 7 13.5 15.5 9 11l-7 7M16 7h6v6',
  door: 'M14 21V4a1 1 0 0 0-1.2-1l-6 1.2A1 1 0 0 0 6 5.2v14.6a1 1 0 0 0 .8 1l6 1.2A1 1 0 0 0 14 21ZM16 8h3v12h-5M10.5 12v.5',
} as const

export function Icon({ name, size = 16, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}
