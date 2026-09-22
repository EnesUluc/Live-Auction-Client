import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  icon?: Parameters<typeof Icon>[0]['name']
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon = 'inbox', title, description, action }: Props) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon name={icon} size={20} />
      </span>
      <span className="empty__title">{title}</span>
      {description && <p className="small" style={{ maxWidth: 380 }}>{description}</p>}
      {action}
    </div>
  )
}
