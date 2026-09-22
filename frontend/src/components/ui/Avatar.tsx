import { hueFromString, initials } from '../../lib/format'

export function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const hue = hueFromString(name)
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: `hsl(${hue} 52% 92%)`,
        color: `hsl(${hue} 42% 34%)`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
