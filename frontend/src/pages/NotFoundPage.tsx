import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'

export function NotFoundPage() {
  return (
    <div className="container page">
      <div className="card">
        <EmptyState
          icon="search"
          title="Sayfa bulunamadı"
          description="Aradığın adres bu uygulamada tanımlı değil."
          action={
            <Link className="btn btn--primary btn--sm" to="/">
              <Icon name="arrowLeft" size={14} />
              Odalara dön
            </Link>
          }
        />
      </div>
    </div>
  )
}
