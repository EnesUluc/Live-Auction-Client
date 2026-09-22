import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LobbyPage } from './pages/LobbyPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RoomPage } from './pages/RoomPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LobbyPage />} />
        <Route path="room/:id" element={<RoomPage />} />
        <Route path="room" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
