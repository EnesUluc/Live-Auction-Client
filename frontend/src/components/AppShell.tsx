import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useIdentity } from '../context/IdentityContext'
import { useTheme } from '../context/ThemeContext'
import { IdentityDialog } from './IdentityDialog'
import { Avatar } from './ui/Avatar'
import { Icon } from './ui/Icon'

export function AppShell() {
  const { userId, isSet } = useIdentity()
  const { theme, toggle } = useTheme()
  const [identityOpen, setIdentityOpen] = useState(false)

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand" aria-label="Ana sayfa">
            <span className="brand__mark">
              <Icon name="gavel" size={18} />
            </span>
            <span className="stack">
              <span>Live Auction</span>
              <span className="brand__sub">gRPC · Spring BFF</span>
            </span>
          </Link>

          <div className="row gap-8">
            <button
              className="btn btn--ghost btn--icon"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>

            <button className="identity-chip" onClick={() => setIdentityOpen(true)}>
              {isSet ? (
                <>
                  <Avatar name={userId} size={24} />
                  <span className="identity-chip__name">{userId}</span>
                </>
              ) : (
                <>
                  <Icon name="user" size={15} />
                  <span className="identity-chip__name">Kimlik seç</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="grow">
        <Outlet />
      </main>

      <footer className="container app-footer">
        <span className="tiny muted">
          CreateAuction · GetAuctionDetails · PlaceBid <span aria-hidden="true">—</span> unary ·
          WatchAuctionRoom · GetAuctionHistory <span aria-hidden="true">—</span> server streaming
        </span>
      </footer>

      <IdentityDialog open={identityOpen} onClose={() => setIdentityOpen(false)} />
    </div>
  )
}
